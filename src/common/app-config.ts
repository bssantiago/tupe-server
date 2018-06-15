import 'reflect-metadata';
import {ConnectionOptions} from 'typeorm';

 export let dbOptions: ConnectionOptions = {
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
