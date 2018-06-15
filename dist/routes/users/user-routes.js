'use strict';
const express = require("express");
const user_controller_1 = require("../../controllers/user-controller");
const middleware_1 = require("../../common/middleware");
const router = express.Router();
router.get('/GetAllUsers', middleware_1.ensureAuthenticated, user_controller_1.getAllUsers);
router.get('/GetUserById', middleware_1.ensureAuthenticated, user_controller_1.getUserById);
router.post('/SaveUser', user_controller_1.saveUser);
router.post('/Login', user_controller_1.login);
router.put('/ResetPassword', user_controller_1.resetPassword);
router.put('/SetPassword', user_controller_1.setPassword);
module.exports = router;
//# sourceMappingURL=user-routes.js.map