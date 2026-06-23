const Joi = require("joi");

exports.registerSchema = Joi.object({

    name:Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

    email:Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

    password:Joi.string()
    .min(8)
    .required(),

    role:Joi.string()
    .valid(
        "fan",
        "creator"
    )
    .optional()

});

exports.loginSchema = Joi.object({

    email:Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

    password:Joi.string()
    .required()

});