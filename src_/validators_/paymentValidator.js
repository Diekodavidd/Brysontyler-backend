const Joi = require('joi');

exports.paymentSchema = Joi.object({

    creatorId:Joi.string()

    .hex()

    .length(24)

    .required(),

    amount:Joi.number()

    .positive()

    .required()

});
