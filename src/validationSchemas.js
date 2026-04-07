const yup = require("yup");

let incorrect_cred = "Your Email or Password is incorrect"

const loginSchema = yup.object().shape({
    email: yup.string().required(incorrect_cred).email(incorrect_cred),
    password: yup.string().required(incorrect_cred).min(6,incorrect_cred),
})

const registerSchema = yup.object().shape({
    email: yup.string().required().email("Your email adress must be a valid email."),
    password: yup.string().required().min(6),
})

const updateUserSchema = yup.object().shape({
    email: yup.string().email(),
    password: yup.object().default(null).nullable().shape({
        old_password: yup.string().required(),
        new_password: yup.string().required().min(6)
    })
})

module.exports = {
    loginSchema,
    registerSchema,
    updateUserSchema
}