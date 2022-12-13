// VALIDATION
const Joi = require("@hapi/joi");

// Register validation
const registerValidation = (data) => {
  const schema = {
    nama: Joi.string().min(8).required(),
    email: Joi.string().min(8).required().email(),
    password: Joi.string().min(8).required(),
  };
  return Joi.validate(data, schema);
};

const loginValidation = (data) => {
  const schema = {
    email: Joi.string().min(8).required().email(),
    password: Joi.string().min(8).required(),
  };
  return Joi.validate(data, schema);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
