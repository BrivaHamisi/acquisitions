import logger from '#config/logger';
import { formatvalidationError } from '#utils/format';
import { signupSchema, signinSchema } from '#validations/auth.validation';
import { createUser, authenticateUser } from '#services/auth.service';
import jwt from 'jsonwebtoken';
import { cookies } from '#utils/cookies';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatvalidationError(validationResult.error)
      });
    }

    const { name, email, password, role } = validationResult.data;

    // Auth Service to Create an account
    const user = await createUser({ name, email, password, role });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      message: 'User Registered',
      user:{
        id: user.id, name:user.name, email:user.email, role:user.role
      }
    });

  }catch(e){
    logger.error('Signup error', e);

    if(e.message === 'User already Exists'){
      return res.status(409).json({error: 'Email already exist'});
    }

    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatvalidationError(validationResult.error)
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser(email, password);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role
      }
    });

  } catch (e) {
    logger.error('Signin error', e);

    if (e.message === 'Invalid email or password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    next(e);
  }
};

export const signout = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    logger.info('User signed out successfully');
    res.status(200).json({ message: 'User signed out successfully' });

  } catch (e) {
    logger.error('Signout error', e);
    next(e);
  }
};