const Joi = require('joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().min(3),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
        code: Joi.string().when('isAdmin', {
            is: true,
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        role: Joi.string().valid('admin', 'eleve', 'enseignant').default('eleve'),
        isAdmin: Joi.boolean().default(false)
    });

    return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6)
    });
    return schema.validate(data);
};

module.exports = { registerValidation, loginValidation };
