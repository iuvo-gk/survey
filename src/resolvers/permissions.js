
module.exports = {
    loginPermissions: (context) => {
        if (!context.user) {
            throw new Error("Not logged in");
        }
    }
}