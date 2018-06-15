"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const user_repository_1 = require("../repositories/user-repository");
const user_entity_1 = require("../entities/user-entity");
const shared_constants_1 = require("../common/shared.constants");
const lodash_1 = require("lodash");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const uuid = require("uuid/v1");
const resetPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    getUserByEmail(req.body.email).then((user) => {
        const token = uuid();
        userRepo.updateUser(req.body.email, token, new Date()).then((result) => {
            const response = { meta: { errCode: 0, msg: '' }, response: result };
            const transporter = nodemailer.createTransport(shared_constants_1.TRANSPORT);
            shared_constants_1.MAILOPTIONS.to = req.body.email;
            shared_constants_1.MAILOPTIONS.html = `<a href="${shared_constants_1.APPDOMAIN}/${token}">Reset your password</a>`;
            transporter.sendMail(shared_constants_1.MAILOPTIONS, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.send(response);
        }).catch((err) => {
            const response = { meta: { errCode: 1, msg: 'Error trying to saveUser' }, response: null };
            res.send(response);
        });
    }).catch((error) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to getUserByEmail' }, response: null };
        res.send(response);
    });
});
exports.resetPassword = resetPassword;
const setPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    userRepo.getUserByToken(req.body.token)
        .then((data) => {
        const currentDate = new Date();
        const timeDiff = Math.abs(currentDate.getTime() - data.user_join_date.getTime());
        const diffHours = Math.ceil(timeDiff / (1000 * 3600));
        if (diffHours < 3) {
            const pass = this.getHashed(req.body.password);
            console.log('passss', pass);
            userRepo.updatePassword(data.token, pass).then((result) => {
                const response = { meta: { errCode: 0, msg: '' }, response: result };
                res.send(response);
            }).catch((err) => {
                const response = { meta: { errCode: 1, msg: 'Error trying to updatePassword' }, response: null };
                res.send(response);
            });
        }
        else {
            const response = { meta: { errCode: 0, msg: 'Timeout' }, response: null };
            res.send(response);
        }
    })
        .catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to getUserByToken' }, response: null };
        res.send(response);
    });
});
exports.setPassword = setPassword;
const getAllUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    userRepo.getAllUsers().then((result) => {
        const response = { meta: { errCode: 0, msg: '' }, response: result };
        res.send(response);
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to getAllUsers' }, response: null };
        res.send(response);
    });
});
exports.getAllUsers = getAllUsers;
const saveUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    const user = new user_entity_1.UserEntity();
    user.user_email = req.body.email;
    user.user_join_date = new Date();
    user.token = '';
    user.user_password = this.getHashed(req.body.password);
    existUser(user.user_email).then((exist) => {
        if (!exist) {
            userRepo.saveUser(user).then((result) => {
                const response = { meta: { errCode: 0, msg: '' }, response: result };
                res.send(response);
            }).catch((err) => {
                const response = { meta: { errCode: 1, msg: 'Error trying to saveUser' }, response: null };
                res.send(response);
            });
        }
        else {
            const response = { meta: { errCode: 1, msg: 'User already exist' }, response: null };
            res.send(response);
        }
    });
});
exports.saveUser = saveUser;
const getUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    userRepo.getUserById(req.body.email)
        .then((result) => {
        const response = { meta: { errCode: 0, msg: '' }, response: result[0] };
        res.send(response);
        return result;
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to getUserById' }, response: null };
        res.send(response);
    });
});
exports.getUserById = getUserById;
const getHashed = (str) => {
    const hash = crypto.createHash('sha512');
    hash.update(str);
    return hash.digest('hex');
};
exports.getHashed = getHashed;
const getUserByEmail = (user_email) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    return userRepo.getUserById(user_email).then((result) => {
        return (result);
    });
});
exports.getUserByEmail = getUserByEmail;
const existUser = (user_email) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    return userRepo.getUserById(user_email).then((result) => {
        return result.length > 0;
    });
});
exports.existUser = existUser;
const login = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const userRepo = new user_repository_1.UserRepo();
    console.log('login', req.body.email, req.body.password);
    const pass = this.getHashed(req.body.password);
    userRepo.login(req.body.email, pass)
        .then((result) => {
        console.log('login', result);
        if (lodash_1.isNil(result)) {
            const responseResult = { data: result, token: uuid() };
            const response = { meta: { errCode: 1, msg: 'User or Password incorrect' }, response: responseResult };
            res.send(response);
        }
        else {
            const responseResult = { data: result, token: uuid() };
            const response = { meta: { errCode: 0, msg: '' }, response: responseResult };
            res.send(response);
        }
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to login' }, response: null };
        res.send(response);
    });
});
exports.login = login;
//# sourceMappingURL=user-controller.js.map