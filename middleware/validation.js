const Joi = require('joi');

// Validation schemas
const appointmentSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9+\-\s]+$/).min(10).max(15),
  email: Joi.string().email(),
  name: Joi.string().min(2).max(50).required(),
  appointments: Joi.array().items(
    Joi.object({
      salonId: Joi.string().required(),
      professionalId: Joi.string().required(),
      serviceName: Joi.string().min(1).max(100).required(),
      price: Joi.number().min(0).required(),
      duration: Joi.string().required(),
      date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
      startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
      timeSlotId: Joi.string().required(),
      memberName: Joi.string().min(1).max(50),
      memberCategory: Joi.string().max(20)
    })
  ).min(1).required()
}).or('phone', 'email');

const salonSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]+$/).min(10).max(15).required(),
  location: Joi.string().min(5).max(200).required(),
  password: Joi.string().min(6).max(100)
});

const serviceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).required(),
  duration: Joi.string().required(),
  gender: Joi.string().valid('Male', 'Female', 'Unisex').required(),
  salonId: Joi.string().required()
});

const professionalSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  specialty: Joi.string().min(2).max(100).required(),
  experience: Joi.string().max(200),
  gender: Joi.string().valid('Male', 'Female').required(),
  salonId: Joi.string().required()
});

const feedbackSchema = Joi.object({
  appointmentId: Joi.string().required(),
  salonId: Joi.string().required(),
  professionalId: Joi.string(),
  userEmail: Joi.string().email().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500)
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  validateRequest,
  appointmentSchema,
  salonSchema,
  serviceSchema,
  professionalSchema,
  feedbackSchema
};