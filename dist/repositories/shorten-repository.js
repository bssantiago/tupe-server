"use strict";
const shorten_entity_1 = require("../entities/shorten-entity");
const typeorm_1 = require("typeorm");
class UrlRepo {
    getAllUrls() {
        return typeorm_1.getManager().getRepository(shorten_entity_1.UrlEntity).find();
    }
    getUrlByNumber(url_number) {
        return typeorm_1.getManager().getRepository(shorten_entity_1.UrlEntity).find({ where: { url_number } });
    }
    saveUrl(user) {
        return typeorm_1.getManager().getRepository(shorten_entity_1.UrlEntity).save(user);
    }
}
exports.UrlRepo = UrlRepo;
//# sourceMappingURL=shorten-repository.js.map