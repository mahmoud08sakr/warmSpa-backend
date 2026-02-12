import Joi from 'joi';

export const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  city: Joi.string().required(),
  gender: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});

export const resetPasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const sendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyOTPSchema = Joi.object({
  OTP: Joi.string().length(6).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
});

// You can add more validation schemas as needed.
