"use strict";
const user_entity_1 = require("../entities/user-entity");
const typeorm_1 = require("typeorm");
class UserRepo {
    getAllUsers() {
        return typeorm_1.getManager().getRepository(user_entity_1.UserEntity).find();
    }
    getUserById(user_email) {
        return typeorm_1.getManager().getRepository(user_entity_1.UserEntity).find({ where: { user_email: user_email } });
    }
    getUserByToken(token) {
        return typeorm_1.getManager().getRepository(user_entity_1.UserEntity).findOne({ where: { token: token } });
    }
    saveUser(user) {
        return typeorm_1.getManager().getRepository(user_entity_1.UserEntity).save(user);
    }
    updateUser(user_email, token, user_join_date) {
        return typeorm_1.getManager().getRepository(user_entity_1.UserEntity).update({ user_email: user_email }, { token: token, user_join_date: user_join_date });
    }
    updatePassword(token, user_password) {
        return typeorm_1.getManager().getRepository(user_entity_1.UserEntity).update({ token: token }, { user_password: user_password });
    }
    login(user_email, user_password) {
        return typeorm_1.getManager().getRepository(user_entity_1.UserEntity).findOne({ where: { user_email: user_email, user_password: user_password } });
    }
}
exports.UserRepo = UserRepo;
//# sourceMappingURL=user-repository.js.map