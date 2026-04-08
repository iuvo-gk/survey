const { initializeServer, server } = require("../src/app");

initializeServer();

module.exports = server.express;
