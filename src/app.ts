import * as express from 'express';
import * as bodyParser from 'body-parser';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as appConfig from './common/app-config';

/**
 * Controllers (route handlers).
 */
import * as userController from './controllers/user-controller';

/**
 * Create Express server.
 */
const app = express();



// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authentication');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 1);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 4000);

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

/**
 * Primary app routes.
 */
app.use('/users', require('./routes/users/user-routes'));
app.use('/predictions', require('./routes/prediction/prediction-routes'));

createConnection(appConfig.dbOptions).then(async connection => {
    console.log('Connected to DB');

}).catch(error => console.log('TypeORM connection error: ', error));

module.exports = app;
