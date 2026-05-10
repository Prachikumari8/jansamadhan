import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import { sendOTP } from '../utils/email.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  user.password = undefined;
  user.otpString = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password, name, role, phone, staffCategory } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: role || 'CITIZEN',
        staffCategory: role === 'STAFF' ? (staffCategory || null) : null,
        otpString: otp,
        otpExpires
      },
    });

    try {
      await sendOTP(email, otp);
    } catch (err) {
      console.error('Email failed to send:', err);
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete signup.',
      data: { email }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otpString !== otp || user.otpExpires < new Date()) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpString: null,
        otpExpires: null
      }
    });

    createSendToken(updatedUser, 200, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.isVerified) {
      // Re-send OTP if not verified
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: user.id },
        data: { otpString: otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) }
      });
      await sendOTP(email, otp);
      return res.status(403).json({
        success: false,
        message: 'Account not verified. New OTP sent to email.'
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    let googleId, email, name;

    try {
      // 1. Try to verify as ID Token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
    } catch (e) {
      // 2. If ID Token fails, treat as Access Token and fetch user info
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`);
      const data = await response.json();
      
      if (!data.email) {
        return next(new AppError('Invalid Google Token', 401));
      }
      
      googleId = data.sub;
      email = data.email;
      name = data.name;
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          isVerified: true,
          role: 'CITIZEN' // Changed from USER to CITIZEN to match your frontend roles
        }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, isVerified: true }
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Google Auth Error:', error);
    next(new AppError('Google authentication failed', 401));
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
