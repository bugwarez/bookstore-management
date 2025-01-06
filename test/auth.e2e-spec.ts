import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/users/dto/create-user.dto';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  const adminEmail = 'admin_auth_e2e@example.com';
  const adminPass = 'adminpass';
  const userEmail = 'user_auth_e2e@example.com';
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login as Admin and return an access token', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({ email: adminEmail, password: adminPass })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should login as User and return an access token', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({ email: userEmail, password: userPass })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return 401 for invalid credentials', async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: adminEmail, password: 'wrongpass' })
        .expect(401);
    });
  });
});
