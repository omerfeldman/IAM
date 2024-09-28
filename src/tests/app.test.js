import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import argon2 from 'argon2';
import speakeasy from 'speakeasy';
import app from '../index.mjs'; 
import { User } from '../DB/userModel.mjs';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Express App Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 and "ok"', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('ok');
    });
  });

  describe('POST /auth/password', () => {
    it('should return 401 for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const wrongPassword = 'WrongPassword!';
      const hashedPassword = await argon2.hash(password);

      await User.create({
        email,
        hashedPassword,
        organization_id: '2974704164',
      });

      const res = await request(app)
        .post('/auth/password')
        .send({ email, password: wrongPassword });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid email or password.');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app).post('/auth/password').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Valid email is required.');
    });
  });

  describe('POST /auth/2FA/register', () => {
    it('should return 404 if secret not found', async () => {
      const res = await request(app)
        .post('/auth/2FA/register')
        .send({
          email: 'nonexistent@example.com',
          orgId: '2974704164',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('did not genarete TOTP, user not found');
    });
  });

  describe('POST /auth/2FA/verify', () => {
    it('should verify TOTP token and return tokens', async () => {
      const email = 'test@example.com';
      const orgId = '2974704164';
      const hashedPassword = await argon2.hash('Password123!');
      const secret = speakeasy.generateSecret().base32;

      await User.create({
        email,
        hashedPassword,
        organization_id: orgId,
        secret,
      });

      const token = speakeasy.totp({
        secret,
        encoding: 'base32',
      });

      const res = await request(app)
        .post('/auth/2FA/verify')
        .send({ email, orgId, token });

      expect(res.statusCode).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should return 401 for invalid token', async () => {
      const email = 'test@example.com';
      const orgId = '2974704164';
      const hashedPassword = await argon2.hash('Password123!');
      const secret = speakeasy.generateSecret().base32;

      await User.create({
        email,
        hashedPassword,
        organization_id: orgId,
        secret,
      });

      const invalidToken = '123456';

      const res = await request(app)
        .post('/auth/2FA/verify')
        .send({ email, orgId, token: invalidToken });

      expect(res.statusCode).toBe(401);
      expect(res.body.verified).toBe(false);
    });
  });
});
