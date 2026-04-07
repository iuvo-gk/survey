
const caseInsensitiveEmail = async (resolve, root, args, context, info) => {
    if (args.email) args.email = args.email.toLowerCase();
    let result = await resolve(root, args, context, info)
    if (info.fieldName === "email") return result.toLowerCase();
    else return result;
}

module.exports = [
    caseInsensitiveEmail
]