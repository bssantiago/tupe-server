"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const prediction_repository_1 = require("../repositories/prediction-repository");
const lodash_1 = require("lodash");
const calculatePositions = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const predictionRepo = new prediction_repository_1.PredictionRepo();
    predictionRepo.getAllPredictions()
        .then((result) => {
        const scores = [];
        const probabilities = matchProbability(result);
        const usersPredictions = lodash_1.groupBy(result, 'iduser');
        predictionRepo.getResults().then((response) => {
            const matches = getMatches(response.data.fixtures);
            for (var property in usersPredictions) {
                if (usersPredictions.hasOwnProperty(property)) {
                    const score = calculateUserScore(property, matches, usersPredictions[property], probabilities);
                    // if (score.charged) {
                    scores.push(score);
                }
            }
            const orderScores = lodash_1.orderBy(scores, x => x.score, ['desc']);
            const resp = { meta: { errCode: 0, msg: '' }, response: orderScores };
            res.send(resp);
        }).catch((err) => {
            throw Error('getResultsError');
        });
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: `Error trying to calculatePositions ${err}` }, response: null };
        res.send(response);
    });
});
exports.calculatePositions = calculatePositions;
const calculateUserScore = (id, matches, predictions, probs) => {
    const userScore = { id: id, name: '', score: 0, charged: false };
    console.log('1', matches);
    lodash_1.each(matches, (match) => {
        const prob = lodash_1.find(probs, x => x.id === match.id);
        const prediction = lodash_1.find(predictions, x => x.match_id === match.id);
        userScore.charged = match.status === 'FINISHED';
        const score = (lodash_1.isNil(prediction) || !userScore.charged) ? 0 : calculateMatchScore(match, prediction, prob);
        if (!lodash_1.isNil(prediction)) {
            userScore.name = prediction.username;
        }
        ;
        userScore.score += score;
    });
    return userScore;
};
exports.calculateUserScore = calculateUserScore;
const matchProbability = (predictions) => {
    const probs = [];
    const pred = lodash_1.groupBy(predictions, 'match_id');
    for (var property in pred) {
        let t1 = 0;
        let t2 = 0;
        let em = 0;
        lodash_1.each(pred[property], (item) => {
            if (item.team1_pred > item.team2_pred) {
                t1++;
            }
            else if (item.team1_pred < item.team2_pred) {
                t2++;
            }
            else {
                em++;
            }
        });
        const total = t1 + t2 + em;
        const min = Math.min(t1, t2, em);
        let mResult = 'em';
        if (min === t1) {
            mResult = 'team1';
        }
        else if (min === t2) {
            mResult = 'team2';
        }
        probs.push({
            id: property,
            matchResult: mResult,
            ponderator: Math.ceil(10 * (0.33 - min / total))
        });
    }
    return probs;
};
exports.matchProbability = matchProbability;
const matchProbabilities = (predictions) => {
    const probs = [];
    const pred = lodash_1.groupBy(predictions, 'match_id');
    for (var property in pred) {
        const t1win = lodash_1.sumBy(pred[property], x => (x.team1_pred > x.team2_pred) ? 1 : 0);
        const t2win = lodash_1.sumBy(pred[property], x => (x.team1_pred < x.team2_pred) ? 1 : 0);
        const draw = lodash_1.sumBy(pred[property], x => (x.team1_pred === x.team2_pred) ? 1 : 0);
        const total = t1win + t2win + draw;
        probs.push({
            match_id: property,
            team1: Math.round((t1win / total) * 100),
            team2: Math.round((t2win / total) * 100),
            draw: Math.round((draw / total) * 100),
        });
    }
    return probs;
};
const calculateMatchScore = (match, prediction, prob) => {
    let score = 0;
    const team1Wins = match.result.team1 > match.result.team2;
    const team2Wins = match.result.team1 < match.result.team2;
    const paired = !team2Wins && !team1Wins;
    const pTeam1Wins = prediction.team1_pred > prediction.team2_pred;
    const pTeam2Wins = prediction.team1_pred < prediction.team2_pred;
    const pPaired = !pTeam2Wins && !pTeam1Wins;
    if (team1Wins && pTeam1Wins) {
        score += 1;
        const pond = (prob.matchResult === 'team1') ? prob.ponderator : 1;
        score = (match.result.team1 === prediction.team1_pred && match.result.team2 === prediction.team2_pred)
            ? score + 3 : score;
        score = score * pond;
    }
    if (team2Wins && pTeam2Wins) {
        score += 1;
        const pond = (prob.matchResult === 'team2') ? prob.ponderator : 1;
        score = (match.result.team1 === prediction.team1_pred && match.result.team2 === prediction.team2_pred)
            ? score + 3 : score;
        score = score * pond;
    }
    if (paired && pPaired) {
        score += 1;
        const pond = (prob.matchResult === 'em') ? prob.ponderator : 1;
        score = (match.result.team1 === prediction.team1_pred && match.result.team2 === prediction.team2_pred)
            ? score + 3 : score;
        score = score * pond;
    }
    return score;
};
exports.calculateMatchScore = calculateMatchScore;
const getMatches = (fixture) => {
    return lodash_1.map(fixture, (item) => {
        // if (item.status === 'FINISHED') {
        const matchId = item._links.self.href.substr(item._links.self.href.lastIndexOf('/') + 1);
        return {
            id: matchId,
            status: item.status,
            date: new Date(item.date).toLocaleDateString(),
            result: {
                team1: lodash_1.isNil(item.result.goalsHomeTeam) ? 0 : item.result.goalsHomeTeam,
                team2: lodash_1.isNil(item.result.goalsAwayTeam) ? 0 : item.result.goalsAwayTeam,
            }
        };
        //}
    });
};
exports.getMatches = getMatches;
const getPredictionsByUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const predictionRepo = new prediction_repository_1.PredictionRepo();
    predictionRepo.getAllPredictions()
        .then((allPredictions) => {
        const probs = matchProbabilities(allPredictions);
        console.log(probs);
        predictionRepo.getPredictionsByUser(req.body.id)
            .then((result) => {
            const items = lodash_1.map(req.body.matches, (item) => {
                const predicted = lodash_1.find(result, (p) => p.match_id === item.id);
                const pitem = {
                    prediction: {
                        isPredicted: !lodash_1.isNil(predicted),
                        team1: !lodash_1.isNil(predicted) ? predicted.team1_pred : 0,
                        team2: !lodash_1.isNil(predicted) ? predicted.team2_pred : 0,
                        probabilities: lodash_1.find(probs, x => x.match_id === item.id)
                    },
                };
                return __assign({}, item, pitem);
            });
            const response = { meta: { errCode: 0, msg: '' }, response: items };
            res.send(response);
            return result;
        }).catch((err) => {
            const response = { meta: { errCode: 1, msg: 'Error trying to getPredictionsByUser' }, response: null };
            res.send(response);
        });
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to getPredictionsByUser' }, response: null };
        res.send(response);
    });
});
exports.getPredictionsByUser = getPredictionsByUser;
const savePrediction = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const predictionRepo = new prediction_repository_1.PredictionRepo();
    predictionRepo.savePrediction(req.body.prediction)
        .then((result) => {
        const response = { meta: { errCode: 0, msg: '' }, response: result };
        res.send(response);
        return result;
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to savePrediction' }, response: null };
        res.send(response);
    });
});
exports.savePrediction = savePrediction;
const updatePrediction = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const predictionRepo = new prediction_repository_1.PredictionRepo();
    console.log('updatePrediction', req);
    predictionRepo.updatePrediction(req.body.prediction)
        .then((result) => {
        console.log('result', result);
        const response = { meta: { errCode: 0, msg: '' }, response: result };
        res.send(response);
        return result;
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to savePrediction' }, response: null };
        res.send(response);
    });
});
exports.updatePrediction = updatePrediction;
//# sourceMappingURL=prediction-controller.js.map