const { loginPermissions } = require("../permissions");
const { default_deletedAt } = require("../../constants");

const createSurvey = async (parent, args, context, info) => {
    loginPermissions(context);
    const survey = await context.db.survey.create({
        data: {
            name: args.name,
            version: 1,
            questions: {
                create: args.questions.map(q => {
                    return {
                        ...q,
                        options: !q.options ? undefined : {
                            create: q.options.map(o => { o.public = true; return o; })
                        },
                        fromSurveyVersion: 1,
                        deletedAt: default_deletedAt
                    }
                })
            },
            surveyEditorState: args.surveyEditorState,
            deletedAt: default_deletedAt
        }
    });
    return survey;
}

const editSurvey = async (parent, args, context, info) => {
    loginPermissions(context);
    const survey = await context.db.survey.findUnique({
        where: { id: args.id },
        select: { id: true, version: true }
    });

    if (!survey) {
        throw new Error("Survey not found");
    }

    await context.db.question.updateMany({
        data: { deletedAt: new Date() },
        where: { surveyId: args.id }
    });

    const updatedSurvey = await context.db.survey.update({
        where:{id:args.id},
        data:{
            name: args.name === undefined ? undefined : args.name,
            version: survey.version + 1,
            surveyEditorState: args.surveyEditorState,
            questions: {
                create: args.questions.map(q => {
                    return {
                        ...q,
                        options: !q.options ? undefined : {
                            create: q.options.map(o => ({ ...o, public: true }))
                        },
                        deletedAt: default_deletedAt,
                        fromSurveyVersion: survey.version + 1
                    }
                })
            }
        }
    });

    return updatedSurvey;
}

const deleteSurvey = async (parent,args,context,info) => {
    loginPermissions(context);
    return await context.db.survey.update({
        where: { id: args.id },
        data: { deletedAt: new Date() }
    });
}

const submitAnswers = async (parent,args,context,info) => {
    return await context.db.$transaction(async (tx) => {
        const survey = await tx.survey.findUnique({
            where: { id: args.survey }
        });

        if (!survey) {
            throw new Error("Survey not found");
        }

        const student = await tx.student.create({
            data: {
                ...args.student,
                survey: { connect: { id: args.survey }}
            }
        });

        for (const a of args.answers){
            await tx.answer.create({
                data: {
                    student: { connect: { id: student.id } },
                    question: { connect: { id: a.question } },
                    value: a.value,
                    option: !a.option ? undefined : {
                        connect: { id: a.option }
                    },
                    options: !a.options || !a.options.length ? undefined : {
                        connect: a.options.map((id) => ({ id }))
                    }
                }
            });
        }

        return survey;
    });
}

module.exports = {
    createSurvey,
    editSurvey,
    deleteSurvey,
    submitAnswers
}
