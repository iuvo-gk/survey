const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { checkValidation, CreateValidationError } = require("../helpers.js");
const { loginSchema, registerSchema } = require("../validationSchemas.js");

const saltRounds = 10;

const createToken = (userId) => {
    const token = jwt.sign({
        userId: userId
    }, process.env.JWT_SECRET);
    return token
}

const login = async (root, args, context, info) => {
    const errors = await checkValidation(loginSchema, args, false) || [];
    const ERROR = CreateValidationError(["Your Email or Password is incorrect"]);
    if (errors.length) {
        throw new ERROR;
    }
    const user = await context.db.user.findUnique({ where: { email: args.email } });
    if (!user) {
        throw new ERROR;
    }
    const validPassword = await bcrypt.compare(args.password, user.password);
    if (!validPassword) {
        throw new ERROR;
    }
    return {
        userId: user.id,
        token: createToken(user.id),
        expiresIn: 1
    };
}

const signUp = async (root, args, context) => {
    let errors = await checkValidation(registerSchema, args, false) || [];
    const hashed_password = await bcrypt.hash(args.password, saltRounds);
    const userParams = {
        first_name: args.first_name,
        last_name: args.last_name,
        email: args.email,
        password: hashed_password
    };
    const invalid_email = errors.some((error) => error.toLowerCase().includes("valid email"));
    let user;
    if (errors.length && !invalid_email) {
        const exists = await context.db.user.findUnique({ where: { email: args.email } });
        if (exists) {
            errors.push("Email is already taken");
        }
    } else if (!invalid_email) {
        try {
            user = await context.db.user.create({ data: userParams });
        } catch (e) {
            if (e.code === "P2002") {
                errors = ["Email is already taken."];
            } else {
                throw e;
            }
        }
    }
    if (errors.length) {
        let ERROR = CreateValidationError(errors);
        throw new ERROR;
    }
    return {
        userId: user.id,
        token: createToken(user.id),
        expiresIn: 1
    };
}

module.exports = {
    login,
    signUp
}
