const Joi = require('joi');

exports.purchaseCoinsSchema = Joi.object({
amount: Joi.number().min(5).required()
});

exports.tipCreatorSchema = Joi.object({
creatorId:Joi.string()
.length(24)
.hex()
.required(),
coins: Joi.number().min(1).required()
});