import { Request, Response } from 'express';
import { UserRepo } from '../repositories/user-repository';
import { UserEntity } from '../entities/user-entity';
import IResponseItem from '../common/response';
import { TRANSPORT, MAILOPTIONS, APPDOMAIN } from '../common/shared.constants';
import { isNil } from 'lodash';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as uuid from 'uuid/v1';

const resetPassword = async (req: Request, res: Response) => {
    const userRepo: UserRepo = new UserRepo();
    getUserByEmail(req.body.email).then((user: UserEntity) => {
        const token = uuid();
        userRepo.updateUser(req.body.email, token, new Date()).then((result: any) => {
            const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: result };
            const transporter = nodemailer.createTransport(TRANSPORT);
            MAILOPTIONS.to = req.body.email;
            MAILOPTIONS.html = `<a href="${APPDOMAIN}/${token}">Reset your password</a>`;
            transporter.sendMail(MAILOPTIONS, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.send(response);
        }).catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to saveUser' }, response: null };
            res.send(response);
        });
    }).catch((error: any) => {
        const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to getUserByEmail' }, response: null };
        res.send(response);
    });
};

const setPassword = async (req: Request, res: Response) => {
    const userRepo: UserRepo = new UserRepo();
    userRepo.getUserByToken(req.body.token)
        .then((data: UserEntity) => {
            const currentDate = new Date();
            const timeDiff = Math.abs(currentDate.getTime() - data.user_join_date.getTime());
            const diffHours = Math.ceil(timeDiff / (1000 * 3600));
            if (diffHours < 3) {
                const pass = this.getHashed(req.body.password);
                console.log('passss', pass);
                userRepo.updatePassword(data.token, pass).then((result: any) => {
                    const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: result };
                    res.send(response);
                }).catch((err: any) => {
                    const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to updatePassword' }, response: null };
                    res.send(response);
                });
            } else {
                const response: IResponseItem = { meta: { errCode: 0, msg: 'Timeout' }, response: null };
                res.send(response);
            }
        })
        .catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to getUserByToken' }, response: null };
            res.send(response);
        });
};

const getAllUsers = async (req: Request, res: Response) => {
    const userRepo: UserRepo = new UserRepo();
    userRepo.getAllUsers().then((result: any) => {
        const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: result };
        res.send(response);
    }).catch((err: any) => {
        const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to getAllUsers' }, response: null };
        res.send(response);
    });
};

const saveUser = async (req: Request, res: Response) => {
    const userRepo: UserRepo = new UserRepo();
    const user: UserEntity = new UserEntity();
    user.user_email = req.body.email;
    user.user_join_date = new Date();
    user.token = '';
    user.user_password = this.getHashed(req.body.password);

    existUser(user.user_email).then((exist: boolean) => {
        if (!exist) {
            userRepo.saveUser(user).then((result: any) => {
                const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: result };
                res.send(response);
            }).catch((err: any) => {
                const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to saveUser' }, response: null };
                res.send(response);
            });
        } else {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'User already exist' }, response: null };
            res.send(response);
        }
    });
};

const getUserById = async (req: Request, res: Response) => {
    const userRepo: UserRepo = new UserRepo();
    userRepo.getUserById(req.body.email)
        .then((result: Array<UserEntity>) => {
            const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: result[0] };
            res.send(response);
            return result;
        }).catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to getUserById' }, response: null };
            res.send(response);
        });
};

const getHashed = (str: string): string => {
    const hash = crypto.createHash('sha512');
    hash.update(str);
    return hash.digest('hex');
};

const getUserByEmail = async (user_email: string): Promise<UserEntity> => {
    const userRepo: UserRepo = new UserRepo();
    return userRepo.getUserById(user_email).then((result: any) => {
        return (result);
    });
};

const existUser = async (user_email: string): Promise<boolean> => {
    const userRepo: UserRepo = new UserRepo();
    return userRepo.getUserById(user_email).then((result: Array<UserEntity>) => {
        return result.length > 0;
    });
};

const login = async (req: Request, res: Response) => {
    const userRepo: UserRepo = new UserRepo();
    console.log('login', req.body.email, req.body.password);
    const pass = this.getHashed(req.body.password);
    userRepo.login(req.body.email, pass)
        .then((result: UserEntity) => {
            console.log('login', result);
            if (isNil(result)) {
                const responseResult = { data: result, token: uuid() };
                const response: IResponseItem = { meta: { errCode: 1, msg: 'User or Password incorrect' }, response: responseResult };
                res.send(response);
            } else {

                const responseResult = { data: result, token: uuid() };
                const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: responseResult };
                res.send(response);
            }


        }).catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to login' }, response: null };
            res.send(response);
        });
};


export { existUser, getUserByEmail, getHashed, getUserById, saveUser, getAllUsers, resetPassword, login, setPassword };
