import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    server = app.getHttpServer();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        email: 'john@example.com',
        password: 'secret',
      };

      const response = await request(server)
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.password).toBeDefined();
      createdUserId = response.body.id;
    });

    it('should fail to create a user with a duplicate email', async () => {
      const createUserDto = {
        email: 'john@example.com',
        password: 'another-secret',
      };

      const response = await request(server)
        .post('/users')
        .send(createUserDto)
        .expect(409);

      expect(response.body.message).toContain('already in use');
    });

    it('should fail with bad email format', async () => {
      const createUserDto = {
        email: 'not-an-email',
        password: 'secret',
      };

      const response = await request(server)
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.message).toContain('email must be an email');
    });
  });

  describe('GET /users', () => {
    it('should retrieve all users', async () => {
      const response = await request(server).get('/users').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].email).toBe('john@example.com');
    });
  });

  describe('GET /users/:id', () => {
    it('should retrieve a single user by id', async () => {
      const response = await request(server)
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body.email).toBe('john@example.com');
    });

    it('should return 404 when user is not found', async () => {
      const nonExistentId = '12345678-abcd-efgh-0000-000000000000';

      const response = await request(server)
        .get(`/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user successfully', async () => {
      const updateUserDto = {
        email: 'john.updated@example.com',
      };

      const response = await request(server)
        .patch(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body.email).toBe('john.updated@example.com');
    });

    it('should throw 409 on email conflict when updating', async () => {
      const secondUser = await prisma.user.create({
        data: {
          email: 'alice@example.com',
          password: 'secret',
        },
      });

      const response = await request(server)
        .patch(`/users/${createdUserId}`)
        .send({ email: 'alice@example.com' })
        .expect(409);

      expect(response.body.message).toContain('already in use');

      await prisma.user.delete({ where: { id: secondUser.id } });
    });

    it('should return 404 if user not found', async () => {
      const fakeId = '12345678-abcd-efgh-0000-000000000999';
      const response = await request(server)
        .patch(`/users/${fakeId}`)
        .send({ email: 'doesnotmatter@example.com' })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete the user successfully', async () => {
      await request(server).delete(`/users/${createdUserId}`).expect(200);

      const response = await request(server)
        .get(`/users/${createdUserId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 404 if user not found', async () => {
      const fakeId = '12345678-abcd-efgh-0000-000000000888';

      const response = await request(server)
        .delete(`/users/${fakeId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });
});
