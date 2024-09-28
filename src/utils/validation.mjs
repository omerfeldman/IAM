import validator from 'validator';
import { Logger } from './logger.mjs';

export const isValidate = (email) => {
    let error = {};

    if (!validator.isEmail(email)) {
        error = 'Invalid email format';
        Logger.error('Invalid email format');
    }

    return error;
};