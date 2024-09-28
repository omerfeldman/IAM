import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import argon2 from 'argon2';
import speakeasy from 'speakeasy';
import { jest } from '@jest/globals';
import { User } from '../DB/userModel.mjs';
import * as iamService from '../services/iam.mjs';

jest.unstable_mockModule('../utils/logger.mjs', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

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

describe('IAM Service Unit Tests', () => {
  describe('authenticateUser', () => {
    it('should authenticate a user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const hashedPassword = await argon2.hash(password);

      await User.create({
        email,
        hashedPassword,
        organization_id: '2974704164',
      });

      const user = await iamService.authenticateUser(email, password);
      expect(user).not.toBeNull();
      expect(user.email).toBe(email);
    });

    it('should return null for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const wrongPassword = 'WrongPassword!';
      const hashedPassword = await argon2.hash(password);

      await User.create({
        email,
        hashedPassword,
        organization_id: '2974704164',
      });

      const user = await iamService.authenticateUser(email, wrongPassword);
      expect(user).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      const user = await iamService.authenticateUser(
        'nonexistent@example.com',
        'Password123!'
      );
      expect(user).toBeNull();
    });
  });

  describe('createTOTP', () => {
    it('should create a TOTP secret for an existing user', async () => {
      const email = 'test@example.com';
      const orgId = '2974704164';
      const hashedPassword = await argon2.hash('Password123!');

      const user = await User.create({
        email,
        hashedPassword,
        organization_id: orgId,
      });

      const secret = await iamService.createTOTP(orgId, email);
      expect(secret).not.toBeNull();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.secret).toBe(secret);
    });

    it('should return null if user does not exist', async () => {
      const secret = await iamService.createTOTP(
        '2974704164',
        'nonexistent@example.com'
      );
      expect(secret).toBeNull();
    });
  });

  describe('verifyTOTP', () => {
    it('should verify a valid TOTP token', async () => {
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

      const verified = await iamService.verifyTOTP(email, orgId, token);
      expect(verified).toBe(true);

      const user = await User.findOne({ email, organization_id: orgId });
      expect(user.mfaEnable).toBe(true);
    });

    it('should return false for invalid TOTP token', async () => {
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

      const verified = await iamService.verifyTOTP(
        email,
        orgId,
        invalidToken
      );
      expect(verified).toBe(false);
    });

    it('should return false if user does not exist', async () => {
      const verified = await iamService.verifyTOTP(
        'nonexistent@example.com',
        '2974704164',
        '123456'
      );
      expect(verified).toBe(false);
    });

    it('should return false if user has no TOTP secret', async () => {
      const email = 'test@example.com';
      const orgId = '2974704164';
      const hashedPassword = await argon2.hash('Password123!');

      await User.create({
        email,
        hashedPassword,
        organization_id: orgId,
        secret: null,
      });

      const token = speakeasy.totp({
        secret: 'dummysecret',
        encoding: 'base32',
      });

      const verified = await iamService.verifyTOTP(email, orgId, token);
      expect(verified).toBe(false);
    });
  });
});
