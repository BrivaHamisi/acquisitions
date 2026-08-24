import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_please_change_in_production'; // Replace with your own secret key
const JWT_EXPIRES_IN = '1d'; // Token expiration time

export const jwttoken = {
    sign: (payload) => {
        try{
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            logger.error('Error generating JWT token:', error);
            throw new Error('Failed to generate JWT token');
        }
    },

    verify: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Error verifying JWT token:', error);
            throw new Error('Invalid or expired JWT token');
        }
};