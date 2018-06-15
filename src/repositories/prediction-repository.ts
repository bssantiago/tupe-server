import { PredictionEntity } from '../entities/prediction-entity';
import { getManager } from 'typeorm';
var axios = require('axios');

export class PredictionRepo {

    public getAllPredictions(): Promise<Array<PredictionEntity>> {
        return getManager().getRepository(PredictionEntity).find();
    }

    public getPredictionsByUser(iduser: string): Promise<Array<PredictionEntity>> {
        return getManager().getRepository(PredictionEntity).find({ where: { iduser } });
    }

    public savePrediction(prediction: PredictionEntity): Promise<PredictionEntity> {
        return getManager().getRepository(PredictionEntity).save(prediction);
    }

    public updatePrediction(prediction: PredictionEntity): Promise<void> {
        console.log('updatePrediction', prediction);
        return getManager().getRepository(PredictionEntity).update(
            { iduser: prediction.iduser, match_id: prediction.match_id },
            { team1_pred: prediction.team1_pred, team2_pred: prediction.team2_pred });
    }

    public getResults(): Promise<any> {
        axios.defaults.headers.common['X-Auth-Token'] = '06ad6c0bcf9840899a35a5504bf3050c';
        return axios.get('http://api.football-data.org/v1/competitions/467/fixtures')

    }
}