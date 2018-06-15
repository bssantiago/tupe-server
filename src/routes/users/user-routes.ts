'use strict';
import * as express from 'express';
import {
    existUser, getUserByEmail, getHashed, getUserById, saveUser,
    getAllUsers, resetPassword, login, setPassword
} from '../../controllers/user-controller';
import { ensureAuthenticated } from '../../common/middleware';

const router = express.Router();

router.get('/GetAllUsers', ensureAuthenticated, getAllUsers);
router.get('/GetUserById', ensureAuthenticated, getUserById);
router.post('/SaveUser', saveUser);
router.post('/Login', login);
router.put('/ResetPassword', resetPassword);
router.put('/SetPassword', setPassword);

module.exports = router;
