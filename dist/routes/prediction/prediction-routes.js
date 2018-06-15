'use strict';
const express = require("express");
const prediction_controller_1 = require("../../controllers/prediction-controller");
const router = express.Router();
router.post('/GetPredictions', prediction_controller_1.getPredictionsByUser);
router.post('/Save', prediction_controller_1.savePrediction);
router.put('/Update', prediction_controller_1.updatePrediction);
router.get('/getMatches', prediction_controller_1.calculatePositions);
module.exports = router;
//# sourceMappingURL=prediction-routes.js.map