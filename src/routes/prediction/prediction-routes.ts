'use strict';
import * as express from 'express';
import {
    getPredictionsByUser, savePrediction, updatePrediction, calculatePositions
} from '../../controllers/prediction-controller';
import { ensureAuthenticated } from '../../common/middleware';

const router = express.Router();

router.post('/GetPredictions', getPredictionsByUser);
router.post('/Save', savePrediction);
router.put('/Update', updatePrediction);

router.get('/getMatches', calculatePositions);

module.exports = router;
