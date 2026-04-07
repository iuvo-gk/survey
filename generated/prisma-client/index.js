"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "QuestionType",
    embedded: false
  },
  {
    name: "OPERATOR_TYPE",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "School",
    embedded: false
  },
  {
    name: "Department",
    embedded: false
  },
  {
    name: "Survey",
    embedded: false
  },
  {
    name: "Question",
    embedded: false
  },
  {
    name: "Option",
    embedded: false
  },
  {
    name: "Answer",
    embedded: false
  },
  {
    name: "Student",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://eu1.prisma.sh/gjergj-kadriu-c6f550/survey/dev`
});
exports.prisma = new exports.Prisma();
