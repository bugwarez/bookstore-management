import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/users/dto/create-user.dto';

describe('Books E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  let adminToken: string;
  let userToken: string;
  let createdBookId: string;

  const adminEmail = 'admin_books_e2e@example.com';
  const adminPass = 'adminpass';
  const userEmail = 'user_books_e2e@example.com';
  const userPass = 'userpass';

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
    await prisma.book.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedAdmin = await bcrypt.hash(adminPass, 10);
    const hashedUser = await bcrypt.hash(userPass, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedAdmin,
        role: Role.ADMIN,
      },
    });
    await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedUser,
        role: Role.USER,
      },
    });

    const adminLogin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPass });

    adminToken = adminLogin.body.accessToken;

    const userLogin = await request(server)
      .post('/auth/login')
      .send({ email: userEmail, password: userPass });

    userToken = userLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /books', () => {
    it('should create a book as Admin', async () => {
      const response = await request(server)
        .post('/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Book 1', author: 'Author 1', price: 15 })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      createdBookId = response.body.id;
    });

    it('should fail if not Admin', async () => {
      await request(server)
        .post('/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Unauthorized Book', author: 'User Author', price: 10 })
        .expect(403);
    });
  });

  describe('GET /books', () => {
    it('should retrieve all books (public)', async () => {
      const response = await request(server).get('/books').expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });

  describe('GET /books/:id', () => {
    it('should retrieve a book by ID (public)', async () => {
      const response = await request(server)
        .get(`/books/${createdBookId}`)
        .expect(200);

      expect(response.body.id).toBe(createdBookId);
    });
  });

  describe('PATCH /books/:id', () => {
    it('should update a book as Admin', async () => {
      const response = await request(server)
        .patch(`/books/${createdBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Book',
          author: 'Updated Author',
          price: 20,
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Book');
    });

    it('should fail if not Admin', async () => {
      await request(server)
        .patch(`/books/${createdBookId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Failed Update' })
        .expect(403);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book as Admin', async () => {
      await request(server)
        .delete(`/books/${createdBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(server).get(`/books/${createdBookId}`).expect(404);
    });
  });
});
