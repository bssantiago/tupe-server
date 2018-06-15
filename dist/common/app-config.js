"use strict";
require("reflect-metadata");
exports.dbOptions = {
    type: 'postgres',
    host: '52.67.173.169',
    port: 5432,
    username: 'postgres',
    password: 'toor',
    database: 'tupe',
    entities: [
        './entities/*.js'
    ],
    autoSchemaSync: true,
};
//# sourceMappingURL=app-config.js.map