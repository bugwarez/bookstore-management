import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Users E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  let createdUserId: string;
  const plainPassword = 'secret';

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
    it('should create a user and hash the password', async () => {
      const createUserDto = {
        email: 'hashed@example.com',
        password: plainPassword,
      };

      const response = await request(server)
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body.password).toBeUndefined();
      expect(response.body.email).toBe('hashed@example.com');
      createdUserId = response.body.id;

      const userInDb = await prisma.user.findUnique({
        where: { id: createdUserId },
      });
      expect(userInDb).toBeDefined();

      const isMatch = await bcrypt.compare(plainPassword, userInDb.password);
      expect(isMatch).toBe(true);
    });

    it('should fail to create user with duplicate email', async () => {
      const createUserDto = {
        email: 'hashed@example.com',
        password: 'anotherPass',
      };

      const response = await request(server)
        .post('/users')
        .send(createUserDto)
        .expect(409);

      expect(response.body.message).toContain('already in use');
    });
  });

  describe('GET /users', () => {
    it('should retrieve all users', async () => {
      const response = await request(server).get('/users').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].email).toBe('hashed@example.com');
    });
  });

  describe('GET /users/:id', () => {
    it('should retrieve the user without exposing the hashed password', async () => {
      const response = await request(server)
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body.password).toBeUndefined();
      expect(response.body.email).toBe('hashed@example.com');
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user and re-hash new password', async () => {
      const updatedPassword = 'newSecret';

      const response = await request(server)
        .patch(`/users/${createdUserId}`)
        .send({ password: updatedPassword })
        .expect(200);

      expect(response.body.password).toBeUndefined();

      const userInDb = await prisma.user.findUnique({
        where: { id: createdUserId },
      });

      const isMatch = await bcrypt.compare(updatedPassword, userInDb.password);
      expect(isMatch).toBe(true);
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
