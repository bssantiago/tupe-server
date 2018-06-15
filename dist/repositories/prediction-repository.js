"use strict";
const prediction_entity_1 = require("../entities/prediction-entity");
const typeorm_1 = require("typeorm");
var axios = require('axios');
class PredictionRepo {
    getAllPredictions() {
        return typeorm_1.getManager().getRepository(prediction_entity_1.PredictionEntity).find();
    }
    getPredictionsByUser(iduser) {
        return typeorm_1.getManager().getRepository(prediction_entity_1.PredictionEntity).find({ where: { iduser } });
    }
    savePrediction(prediction) {
        return typeorm_1.getManager().getRepository(prediction_entity_1.PredictionEntity).save(prediction);
    }
    updatePrediction(prediction) {
        console.log('updatePrediction', prediction);
        return typeorm_1.getManager().getRepository(prediction_entity_1.PredictionEntity).update({ iduser: prediction.iduser, match_id: prediction.match_id }, { team1_pred: prediction.team1_pred, team2_pred: prediction.team2_pred });
    }
    getResults() {
        axios.defaults.headers.common['X-Auth-Token'] = '06ad6c0bcf9840899a35a5504bf3050c';
        return axios.get('http://api.football-data.org/v1/competitions/467/fixtures');
    }
}
exports.PredictionRepo = PredictionRepo;
//# sourceMappingURL=prediction-repository.js.map