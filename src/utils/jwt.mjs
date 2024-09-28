import jwt from 'jsonwebtoken';
import { initConfig } from './config.mjs';

const config = initConfig();

export const createJwtToken = (email, orgId) => {
    return jwt.sign(
        { email: email, orgId: orgId, role: "user" },
        config.jwtSecret,
        { expiresIn: '24h' }
    );
};
