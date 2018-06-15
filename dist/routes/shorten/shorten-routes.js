'use strict';
const express = require("express");
const shorten_controller_1 = require("../../controllers/shorten-controller");
const middleware_1 = require("../../common/middleware");
const router = express.Router();
router.get('/GetUrl', middleware_1.ensureAuthenticated, shorten_controller_1.getRealUrl);
router.post('/Decode', middleware_1.ensureAuthenticated, shorten_controller_1.decode);
module.exports = router;
//# sourceMappingURL=shorten-routes.js.map