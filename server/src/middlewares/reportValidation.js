import { body, validationResult } from 'express-validator';
import { AppError } from './errorMiddleware.js';

export const validateReport = [
  body('issueType')
    .notEmpty().withMessage('Issue type is required')
    .isString().withMessage('Issue type must be a string'),
  
  body('description')
    .optional({ values: 'falsy' })
    .isString().withMessage('Description must be a string'),
  
  body('latitude')
    .notEmpty().withMessage('Latitude is required'),
  
  body('longitude')
    .notEmpty().withMessage('Longitude is required'),
  
  body('address')
    .notEmpty().withMessage('Address is required')
    .isString().withMessage('Address must be a string'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  }
];

export const validateStatusUpdate = [
  body('status')
    .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'])
    .withMessage('Invalid status value'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];
