import * as authService from '../services/iam.mjs';
import { isValidate } from '../utils/validation.mjs';
import { createJwtToken } from '../utils/jwt.mjs';

export async function passwordAuth(req, res, next) {
    const { email, password } = req.body;
  
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Valid email is required.' });
  
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    const validationErrors = isValidate(email);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    try {
      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
  
      res.status(200).json({
        userData: {
          email: user.email,
          orgId: user.orgId,
          role: 'user',
        },
        verified: true,
      });
    } catch (err) {
      next(err);
    }
  }

export async function registerTOTP(req, res, next) {
  const { email, orgId } = req.body;
  try {
    const QRToken = await authService.createTOTP(orgId, email);
    if (!QRToken) {
      return res.status(404).json({ message: 'did not genarete TOTP, user not found' });
    }
    res.status(200).json({ message: 'TOTP registration successful',QRToken: QRToken });
  } catch (error) {
    next(error);
  }
}

export async function verifyTOTP(req, res, next) {
  const { email, orgId, token } = req.body;
  try {
    const verified = await authService.verifyTOTP(email, orgId, token);
    if (verified) {
      const jwtToken = createJwtToken(email, orgId);
      res.json({
        verified: true,
        accessToken: jwtToken,
        tokenType: 'bearer',
      });
    } else {
      res.status(401).json({ verified: false, message: 'Invalid TOTP token' });
    }
  } catch (error) {
    next(error);
  }
}