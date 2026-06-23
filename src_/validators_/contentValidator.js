const Joi = require('joi');

exports.uploadContentSchema = Joi.object({

    title:Joi.string()

    .trim()

    .min(3)

    .max(100)

    .required(),

    pprotection:Joi.object({

    subscribersOnly:Joi.boolean(),

    watermark:Joi.boolean(),

    downloadDisabled:Joi.boolean()

}).optional()

});
