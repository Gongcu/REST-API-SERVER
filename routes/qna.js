const express = require('express');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Alarm = require('../models/alarm');
const User = require('../models/user')
const deleteRow = require('../etc/deleteRow');
const nodemailer = require('nodemailer');
const Club_user = require('../models/club_user');
const fcmPushGenerator = require('../fcm/fcmPushGenerator')
const updateRow = require('../etc/updateRow')
const router = express.Router();


//POSTMAN, 해당하는 동아리의 질문, 답변 목록을 전부 가져옴
router.get('/:clubId', async (req, res, next) => {
    try {
        const question = await Question.findAll({
            where: { clubId: req.params.clubId },
            include: [{
                model: Answer,
            }, {
                model: User,
                attributes: ['id', 'name']
            }]

        });
        if (question.length)
            res.status(200).send(question);
        else
            res.status(204).send();
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: APP으로 보낸 나의 문의사항 
router.get('/app/:userId', async (req, res, next) => {
    try {
        const question = await Question.findAll({
            where: { userId: req.params.userId, clubId: null },
            include: [{
                model: Answer,
            }, {
                model: User,
                attributes: ['id', 'name']
            }]
        })
        if (question.length)
            res.status(200).send(question);
        else
            res.status(204).send();
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 질문 작성@ + PUSH
router.post('/question', async (req, res, next) => {
    let transaction;
    try {
        transaction = await Question.sequelize.transaction();
        await Question.create({
            clubId: req.body.clubId,
            userId: req.body.userId,
            question: req.body.question,
            //createdAt은 질문 생성시 default 처리
        }, { transaction: transaction }).then(async(item)=>{
            //PUSH
            var token = new Array()

            const managers = await Club_user.sequelize.query(
                'SELECT u.id, u.token ' +
                `FROM club_users cu join users u on cu.userId=u.id ` +
                `WHERE cu.clubId=${req.body.clubId} AND cu.authority NOT LIKE '멤버' AND u.pushAlarm = true AND cu.alarm = true`,
                { transaction: transaction }
            );

            for (var i = 0; i < managers[0].length; i++) {
                token[i] = managers[0][i].token;
                await Alarm.create({
                    content: "새로운 문의사항이 작성되었습니다.",
                    clubId: req.body.clubId,
                    questionId: item.dataValues.id,
                    userId: managers[0][i].id
                }, { transaction: transaction });
            }

            fcmPushGenerator(token, "새로운 문의사항이 작성되었습니다.", req.body.clubId, "Q&A");

            const question = await Question.findAll({
                where: { id:item.dataValues.id},
                include: [{
                    model: User,
                    attributes: ['id', 'name']
                }],
                transaction:transaction
            })
            res.status(200).send(question);
        }).then(async()=>{
            await transaction.commit();
        });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 앱으로 질문 작성@
router.post('/app/question', async (req, res, next) => {
    try {
        await Question.create({
            userId: req.body.userId,
            question: req.body.question,
            //createdAt은 질문 생성시 default 처리
        }).then(async(item)=>{
            const emailAddress = 'gombangapp@gmail.com'

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.NODEMAILER_USER,
                    pass: process.env.NODEMAILER_PASS,
                },
            });
    
            let mailOptions = await transporter.sendMail({
                from: `곰방`,
                to: emailAddress,
                subject: '새로운 문의사항이 등록되었습니다',
                text: '새로운 문의사항이 등록되었습니다',
            });
    
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                console.log("Finish sending email : " + info.response);
                transporter.close()
            });
            const question = await Question.findAll({
                where: { id: item.dataValues.id },
                include: [{
                    model: User,
                    attributes: ['id', 'name']
                }]
            });
            res.status(200).send(question);
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 답글 작성@ + PUSH
router.post('/answer', async (req, res, next) => {
    let transaction;
    try {
        transaction = await Answer.sequelize.transaction();
        const answer = await Answer.create({
            answer: req.body.answer,
        }, { transaction: transaction });

        const question = await Question.findOne({
            where: { id: req.body.questionId },
            transaction: transaction
        });
        question.answerId = answer.id;
        await question.save({ transaction: transaction });

        await Alarm.create({
            content: "질문에 답변이 작성되었습니다.",
            clubId: question.clubId,
            questionId: req.body.questionId,
            userId: question.userId
        }, { transaction: transaction });

        //PUSH
        const user = await User.sequelize.query(
            `SELECT token FROM users WHERE id=${question.userId} AND pushAlarm=true `,
            { transaction: transaction }
        )

        var token = new Array()
        token[0] = user[0][0].token;

        if(question.clubId)//동아리로의 문의사항인 경우만 전송
            fcmPushGenerator(token, "질문에 답변이 작성되었습니다.", question.clubId, "Q&A");

        await transaction.commit();
        res.status(200).send(answer);
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN:질문수정
router.patch('/question/:questionId', async (req, res, next) => {
    try {
        const result = await Question.update({
            question: req.body.question
        }, {
            where: { id: req.params.questionId, answerId: null }
        })
        if (updateRow(result).result) {
            const question = await Question.findAll({
                where: { id: req.params.questionId },
                include: [{
                    model: User,
                    attributes: ['id', 'name']
                }]
            });
            res.status(200).send(question);
        } else {
            res.status(204).send()
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN:답글 수정@
router.patch('/answer/:answerId', async (req, res, next) => {
    try {
        const answer = await Answer.findOne({ where: { id: req.params.answerId } });
        if (answer) {
            answer.answer = req.body.answer;
            await answer.save();
            res.status(200).send(answer);
        } else {
            res.status(204).send()
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 질문 삭제, 답변이 존재할 경우 답변도 삭제@
router.delete('/question/:questionId', async (req, res, next) => {
    let transaction;
    try {
        transaction = await Question.sequelize.transaction();
        const question = await Question.findOne({
            where: { id: req.params.questionId },
            transaction: transaction
        });
        const result = await Question.destroy({
            where: { id: req.params.questionId },
            transaction: transaction
        });
        await Answer.destroy({
            where: { id: question.answerId },
            transaction: transaction
        });
        await transaction.commit();

        if (deleteRow(result).result)
            res.status(200).send(true)
        else
            res.status(204).send();
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 답변 삭제
router.delete('/answer/:answerId', async (req, res, next) => {
    let transaction;
    try {
        transaction = await Question.sequelize.transaction();
        const result = await Answer.destroy({
            where: { id: req.params.answerId }
        });
        await Question.update({
            answerId: null
        }, {
            where: { answerId: req.params.answerId }
        })
        await transaction.commit();

        if (deleteRow(result).result)
            res.status(200).send(true)
        else
            res.status(204).send();
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

module.exports = router;
