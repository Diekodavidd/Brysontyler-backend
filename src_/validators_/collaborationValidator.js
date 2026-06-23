const Joi = require('joi');

exports.requestSchema = Joi.object({

    receiverId:Joi.string()

    .hex()

    .length(24)

    .required(),

    message:Joi.string()

    .max(500)

    .required()

});