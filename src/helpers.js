const { createError } = require("apollo-errors");

const CreateValidationError = (errors) => {
    return createError("ValidationError", {
        message: "Invalid arguments were provided.",
        data: {
            errors
        }
    })
}

const checkValidation = async (schema,args,throwErr=true) => {
    if (!throwErr) {
        return await schema.validate(args, { abortEarly: false })
            .then(() => [])
            .catch(err => err.errors);
    }

    return await schema.validate(args, { abortEarly: false }).catch(err => {
        let ERROR = CreateValidationError(err.errors)
        if (throwErr){
            throw new ERROR;
        }
    })
}

module.exports = {
    CreateValidationError,
    checkValidation
}
