const Joi = require('joi');

exports.subscribeSchema = Joi.object({

    creatorId:Joi.string()

    .hex()

    .length(24)

    .required(),

    amount:Joi.number()

    .positive()

    .required()

});