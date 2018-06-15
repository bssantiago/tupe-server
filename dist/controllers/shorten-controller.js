"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const shorten_repository_1 = require("../repositories/shorten-repository");
const shorten_entity_1 = require("../entities/shorten-entity");
const random = require('random-key');
const getRealUrl = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const urlRepo = new shorten_repository_1.UrlRepo();
    urlRepo.getUrlByNumber(req.query.nurl).then((data) => {
        const response = { meta: { errCode: 0, msg: '' }, response: data[0] };
        res.send(response);
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to save getUrlByNumber' }, response: null };
        res.send(response);
    });
});
exports.getRealUrl = getRealUrl;
const decode = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const urlRepo = new shorten_repository_1.UrlRepo();
    const result = dencodeFunction(req.body.surl);
    const url = new shorten_entity_1.UrlEntity();
    url.url_number = result;
    url.url_original = req.body.surl;
    urlRepo.saveUrl(url).then((data) => {
        const response = { meta: { errCode: 0, msg: '' }, response: data };
        res.send(response);
    }).catch((err) => {
        const response = { meta: { errCode: 1, msg: 'Error trying to save saveUrl' }, response: null };
        res.send(response);
    });
});
exports.decode = decode;
const dencodeFunction = (str) => {
    return random.generateBase30(5);
};
//# sourceMappingURL=shorten-controller.js.map