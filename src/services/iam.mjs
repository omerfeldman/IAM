import { Logger } from '../utils/logger.mjs';
import argon2 from 'argon2';
import speakeasy from 'speakeasy';
import { User } from '../DB/userModel.mjs';

export async function authenticateUser(email, password) {
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      Logger.warn(`User not found: ${email}`);
      return null;
    }

    const isPasswordCorrect = await argon2.verify(
      user.hashedPassword,
      password
    );
    if (isPasswordCorrect) {
      return user;
    } else {
      Logger.warn(`Incorrect password for user: ${email}`);
      return null;
    }
  } catch (err) {
    Logger.error(`Error during authentication: ${err}`);
    throw new Error('Error during authentication');
  }
}

export async function createTOTP(orgId, email) {
  try {
    const user = await User.findOne({ email, organization_id: orgId }).exec()
    if (!user) {
      Logger.error('User not found');
      return null;
    }

    const secret = speakeasy.generateSecret();
    user.secret = secret.base32;
    await user.save();

    return secret.base32;
  } catch (err) {
    Logger.error(`Error during TOTP creation: ${err}`);
    throw new Error('Error during TOTP creation');
  }
}

export async function verifyTOTP(email, orgId, token) {
  try {
    const user = await User.findOne({ email, organization_id: orgId }).exec();
    if (!user) {
      Logger.error('User not found');
      return false;
    }

    if (!user.secret) {
      Logger.error('No TOTP secret set for user');
      return false;
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      if (!user.mfaEnable) {
        user.mfaEnable = true;
        await user.save();
        Logger.info(`MFA enabled for user: ${email}`);
      }
      return true;
    } else {
      Logger.warn('Invalid TOTP token');
      return false;
    }
  } catch (err) {
    Logger.error(`Error during TOTP verification: ${err}`);
    throw new Error('Error during TOTP verification');
  }
}

