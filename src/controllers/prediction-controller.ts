import { Request, Response } from 'express';
import { PredictionRepo } from '../repositories/prediction-repository';
import { PredictionEntity } from '../entities/prediction-entity';
import IResponseItem from '../common/response';
import { ALPHABET, BASE } from '../common/shared.constants';
import { isNil, map, find, groupBy, each, countBy, orderBy, filter, sumBy } from 'lodash';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as uuid from 'uuid/v1';

const calculatePositions = async (req: Request, res: Response) => {
    const predictionRepo: PredictionRepo = new PredictionRepo();
    predictionRepo.getAllPredictions()
        .then((result: Array<PredictionEntity>) => {
            const scores: Array<any> = [];
            const probabilities = matchProbability(result);
            const usersPredictions = groupBy(result, 'iduser');
            predictionRepo.getResults().then((response: any) => {
                const matches = getMatches(response.data.fixtures);

                for (var property in usersPredictions) {
                    if (usersPredictions.hasOwnProperty(property)) {

                        const score = calculateUserScore(property, matches, usersPredictions[property], probabilities);

                        // if (score.charged) {

                        scores.push(score);
                        // }
                    }
                }
                const orderScores = orderBy(scores, x => x.score, ['desc']);
                const resp: IResponseItem = { meta: { errCode: 0, msg: '' }, response: orderScores };
                res.send(resp);

            }).catch((err: any) => {
                throw Error('getResultsError');
            });
        }).catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: `Error trying to calculatePositions ${err}` }, response: null };
            res.send(response);
        });
};

const calculateUserScore = (id: string, matches: Array<any>, predictions: Array<any>, probs: Array<any>) => {
    const userScore = { id: id, name: '', score: 0, charged: false };
    console.log('1', matches);
    each(matches, (match) => {
        const prob = find(probs, x => x.id === match.id);
        const prediction = find(predictions, x => x.match_id === match.id);
        userScore.charged = match.status === 'FINISHED';
        const score = (isNil(prediction) || !userScore.charged) ? 0 : calculateMatchScore(match, prediction, prob);
        if (!isNil(prediction)) {
            userScore.name = prediction.username;
        };
        userScore.score += score;
    });

    return userScore;
}

const matchProbability = (predictions: Array<PredictionEntity>) => {
    const probs = [];
    const pred = groupBy(predictions, 'match_id');

    for (var property in pred) {
        let t1 = 0; let t2 = 0; let em = 0;
        each(pred[property], (item) => {
            if (item.team1_pred > item.team2_pred) {
                t1++;
            } else if (item.team1_pred < item.team2_pred) {
                t2++;
            } else {
                em++;
            }
        });
        const total = t1 + t2 + em;
        const min = Math.min(t1, t2, em);
        let mResult = 'em';
        if (min === t1) {
            mResult = 'team1'
        } else if (min === t2) {
            mResult = 'team2'
        }
        probs.push({
            id: property,
            matchResult: mResult,
            ponderator: Math.ceil(10 * (0.33 - min / total))
        });
    }
    return probs;
}

const matchProbabilities = (predictions: Array<PredictionEntity>) => {
    const probs = [];
    const pred = groupBy(predictions, 'match_id');

    for (var property in pred) {

        const t1win = sumBy(pred[property], x => (x.team1_pred > x.team2_pred) ? 1 : 0);
        const t2win = sumBy(pred[property], x => (x.team1_pred < x.team2_pred) ? 1 : 0);
        const draw = sumBy(pred[property], x => (x.team1_pred === x.team2_pred) ? 1 : 0);

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

const calculateMatchScore = (match: any, prediction: any, prob: any) => {
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

const getMatches = (fixture: Array<any>) => {
    return map(fixture, (item: any) => {
        // if (item.status === 'FINISHED') {
        const matchId = item._links.self.href.substr(item._links.self.href.lastIndexOf('/') + 1);
        return {
            id: matchId,
            status: item.status,
            date: new Date(item.date).toLocaleDateString(),
            result: {
                team1: isNil(item.result.goalsHomeTeam) ? 0 : item.result.goalsHomeTeam,
                team2: isNil(item.result.goalsAwayTeam) ? 0 : item.result.goalsAwayTeam,
            }
        };
        //}
    });
}

const getPredictionsByUser = async (req: Request, res: Response) => {
    const predictionRepo: PredictionRepo = new PredictionRepo();

    predictionRepo.getAllPredictions()
        .then((allPredictions: Array<PredictionEntity>) => {
            const probs = matchProbabilities(allPredictions);
            console.log(probs);
            predictionRepo.getPredictionsByUser(req.body.id)
                .then((result: Array<PredictionEntity>) => {
                    const items = map(req.body.matches, (item: any) => {

                        const predicted = find(result, (p) => p.match_id === item.id);

                        const pitem = {
                            prediction: {
                                isPredicted: !isNil(predicted),
                                team1: !isNil(predicted) ? predicted.team1_pred : 0,
                                team2: !isNil(predicted) ? predicted.team2_pred : 0,
                                probabilities: find(probs, x => x.match_id === item.id)
                            },
                        };
                        return { ...item, ...pitem };
                    });


                    const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: items };
                    res.send(response);
                    return result;
                }).catch((err: any) => {
                    const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to getPredictionsByUser' }, response: null };
                    res.send(response);
                });

        }).catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to getPredictionsByUser' }, response: null };
            res.send(response);
        });
};

const savePrediction = async (req: Request, res: Response) => {
    const predictionRepo: PredictionRepo = new PredictionRepo();
    predictionRepo.savePrediction(req.body.prediction)
        .then((result: PredictionEntity) => {
            const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: result };
            res.send(response);
            return result;
        }).catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to savePrediction' }, response: null };
            res.send(response);
        });
};

const updatePrediction = async (req: Request, res: Response) => {
    const predictionRepo: PredictionRepo = new PredictionRepo();
    console.log('updatePrediction', req);
    predictionRepo.updatePrediction(req.body.prediction)
        .then((result: any) => {
            console.log('result', result);
            const response: IResponseItem = { meta: { errCode: 0, msg: '' }, response: result };
            res.send(response);
            return result;
        }).catch((err: any) => {
            const response: IResponseItem = { meta: { errCode: 1, msg: 'Error trying to savePrediction' }, response: null };
            res.send(response);
        });
};

export { getPredictionsByUser, savePrediction, updatePrediction, calculateMatchScore, getMatches, matchProbability, calculateUserScore, calculatePositions };