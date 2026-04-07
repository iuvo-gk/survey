const bcrypt = require("bcryptjs");
const permissions = require("../permissions");
const { CreateValidationError, checkValidation } = require("../../helpers.js");
const { updateUserSchema } = require("../../validationSchemas.js");

const saltRounds = 10;

const updateUser = async (parent,args,context,info) => {
	permissions.loginPermissions(context);
	let errors = await checkValidation(updateUserSchema, args,false) || [];
    const data = {};

    if (args.first_name !== undefined) data.first_name = args.first_name;
    if (args.last_name !== undefined) data.last_name = args.last_name;
    if (args.email !== undefined) data.email = args.email;

	if (args.password) {
		const user = await context.db.user.findUnique({ where: { id: context.user.id } });
		const validOldPassword = await bcrypt.compare(args.password.old_password,user.password);
		if (!validOldPassword){
			errors.length ? errors.push("old_password is incorrect") : errors = ["old_password is incorrect"]
		}
		data["password"] = await bcrypt.hash(args.password.new_password,saltRounds);
	}
	if (errors.length){
		let ValidationError = CreateValidationError(errors);
		throw new ValidationError
	}
	return await context.db.user.update({
		data,
		where:{id:context.user.id}
	});
}

module.exports = {
	updateUser
}
