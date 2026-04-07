const userResolvers = require("./models/User");
const authResolvers = require("./auth");
const surveyResolvers = require("./models/Survey");
const { default_deletedAt } = require("../constants");

const includeAnswerRelations = {
    option: true,
    options: true,
    student: true
};

module.exports = {
    Mutation: {
        ...userResolvers,
        ...authResolvers,
        ...surveyResolvers
    },
    Query: {
        getLoggedInUser: async (parent, args, context, info) => {
            if (!context.user) {
                return null;
            }
            return await context.db.user.findUnique({ where: { id: context.user.id } });
        },
        surveys: async (parent,args,context,info) => {
            return await context.db.survey.findMany({ where: {
                deletedAt: default_deletedAt
            }});
        },
        survey: async (parent,args,context,info) => {
            return await context.db.survey.findUnique({ where: { id: args.id } });
        },
        students: async (parent, args, context, info) => {
            return await context.db.student.findMany();
        },
        getSurveysInfo: async (parent,args,context,info) => {
            const surveys = await context.db.survey.findMany({
                where: { deletedAt: default_deletedAt },
                select: { id: true, name: true, version: true }
            });
            const data = [];

            for (const survey of surveys){
                for (let x = 1; x <= survey.version; x++){
                    const surveyClone = { ...survey, version: x };
                    const questions = await context.db.question.findMany({
                        where: {
                            surveyId: surveyClone.id,
                            fromSurveyVersion: x
                        },
                        include: {
                            options: true
                        }
                    });

                    const questionAnswers = [];

                    for (const question of questions){
                        const answers = await context.db.answer.findMany({
                            where: { questionId: question.id },
                            include: includeAnswerRelations
                        });

                        questionAnswers.push({
                            question,
                            answers
                        });
                    }

                    data.push({
                        survey: surveyClone,
                        question_answers: questionAnswers
                    });
                }
            }

            return data;
        },
        stats: async (parent, args, context, info) => { return {} }
    },
    Survey: {
        questions: async (parent,args,context,info) => {
            return await context.db.question.findMany({
                where: {
                    surveyId: parent.id,
                    deletedAt: default_deletedAt
                }
            });
        }
    },
    Question: {
        survey: async (parent, args, context) => {
            return parent.survey || context.db.survey.findUnique({ where: { id: parent.surveyId } });
        },
        answers: async (parent, args, context) => {
            return parent.answers || context.db.answer.findMany({
                where: { questionId: parent.id },
                include: includeAnswerRelations
            });
        },
        options: async (parent, args, context) => {
            return parent.options || context.db.option.findMany({
                where: {
                    questionId: parent.id,
                    deletedAt: default_deletedAt
                }
            });
        }
    },
    Option: {
        question: async (parent, args, context) => {
            return parent.question || context.db.question.findUnique({ where: { id: parent.questionId } });
        },
        addedBy: async (parent, args, context) => {
            if (parent.addedBy) {
                return parent.addedBy;
            }
            if (!parent.addedById) {
                return null;
            }
            return context.db.student.findUnique({ where: { id: parent.addedById } });
        }
    },
    Answer: {
        question: async (parent, args, context) => {
            return parent.question || context.db.question.findUnique({ where: { id: parent.questionId } });
        },
        option: async (parent, args, context) => {
            if (parent.option) {
                return parent.option;
            }
            if (!parent.optionId) {
                return null;
            }
            return context.db.option.findUnique({ where: { id: parent.optionId } });
        },
        options: async (parent, args, context) => {
            return parent.options || context.db.answer.findUnique({ where: { id: parent.id } }).options();
        },
        student: async (parent, args, context) => {
            if (parent.student) {
                return parent.student;
            }
            if (!parent.studentId) {
                return null;
            }
            return context.db.student.findUnique({ where: { id: parent.studentId } });
        }
    },
    Student: {
        survey: async (parent, args, context) => {
            return parent.survey || context.db.survey.findUnique({ where: { id: parent.surveyId } });
        },
        answers: async (parent, args, context) => {
            return parent.answers || context.db.answer.findMany({
                where: { studentId: parent.id },
                include: includeAnswerRelations
            });
        },
        department: async (parent, args, context) => {
            if (parent.department) {
                return parent.department;
            }
            if (!parent.departmentId) {
                return null;
            }
            return context.db.department.findUnique({ where: { id: parent.departmentId } });
        },
        answers_len: async (parent, args, context, info) => {
            return await context.db.answer.count({
                where: {
                    studentId: parent.id
                }
            });
        }
    },
    Statistic: {
        students_len: async (parent, args, context, info) => {
            return await context.db.student.count();
        },
        answers_len: async (parent,args,context,info) => {
            return await context.db.answer.count();
        },
        surveys_len: async (parent, args, context, info) => {
            return await context.db.survey.count();
        },
        questions_len: async (parent, args, context, info) => {
            return await context.db.question.count();
        },
    }
}
