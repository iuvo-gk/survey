const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const graphqlServer = require("graphql-yoga").GraphQLServer;
const resolvers = require("./resolvers/index.js");
const jwt = require("jsonwebtoken");
const { formatError } = require("apollo-errors");
const middlewares = require("./middlewares");
const prisma = require("./prisma");
// var health = require('express-ping');

const options = {
	formatError,
	port: process.env.PORT || 4000
};

const server = new graphqlServer({
	typeDefs: path.resolve(__dirname, "schema.graphql"),
	middlewares,
	resolvers,
	context: async req => {
		let user;
		if (req.request.headers["authorization"]) {
			const token = req.request.headers["authorization"].split(" ")[1];
			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				user = await prisma.user.findUnique({
					where: { id: decoded.userId },
					select: {
						id: true,
						first_name: true,
						last_name: true,
						email: true,
						createdAt: true,
						updatedAt: true
					}
				});
			} catch (error) {
				user = undefined;
			}
		}
		return {
			req,
			user,
			db: prisma
		};
	}
});

const shutdown = async () => {
	await prisma.$disconnect();
	process.exit(0);
};

const startServer = () => {
	server.start(options, () => console.log(`Running on port ${options.port}`));

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
};

if (require.main === module) {
	startServer();
}

module.exports = {
	server,
	startServer
};
