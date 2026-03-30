import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import * as UserModel from '../models/user.model.js';

dotenv.config();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

export const hashPassword = async (req, res, next) => {
  try {
    const { password_hash } = req.body;
    if (!password_hash) return next();
    req.body.password_hash = await bcrypt.hash(password_hash, BCRYPT_ROUNDS);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    return res.status(500).json({ message: 'Error processing password' });
  }
};

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = payload.sub;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next();
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(payload.sub);
    if (user) {
      req.userId = payload.sub;
      req.user = user;
    }

    next();
  } catch (err) {
    next();
  }
};

export default { hashPassword, authenticate, optionalAuth };
