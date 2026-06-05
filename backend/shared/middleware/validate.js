const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) req.body = schema.body.parse(req.body);
        if (schema.query) req.query = schema.query.parse(req.query);
        if (schema.params) req.params = schema.params.parse(req.params);
        next();
    } catch (err) {
        if (err.name === 'ZodError' || err instanceof ZodError) {
            const firstError = err.errors && err.errors.length > 0 ? err.errors[0] : { message: 'Validation failed', path: [] };
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: firstError.message,
                    field: firstError.path.join('.'),
                    status: 400
                }
            });
        }
        next(err);
    }
};

module.exports = validate;
