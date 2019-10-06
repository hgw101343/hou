/**
 * Module dependencies.
 */
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./default');
const history = require('connect-history-api-fallback');


/**
 * Initialize application middleware.
 *
 * @method initMiddleware
 * @param {Object} app The express application
 * @private
 */
function initMiddleware(app) {
	// Enable jsonp
	app.enable('jsonp callback');

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.json({
		limit: '2mb',
	}));

	app.use(bodyParser.urlencoded({
		limit: '2mb',
		extended: true,
		keepExtensions: true,
	}));

	// 设置静态文件目录
	app.use('/qu_elfront_service', express.static(path.join(__dirname, '../dist')));

	// 重定向
	app.get('/qu_elfront_service/', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'))
    })
}
/**
 * Configure Helmet headers configuration.
 *
 * @method initHelmetHeaders
 * @param {Object} app The express application
 * @private
 */
function initHelmetHeaders(app) {
	// Use helmet to secure Express headers
	app.use(helmet.frameguard());
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.ieNoOpen());
	app.disable('x-powered-by');
}

/**
 * Configure CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests.
 *
 * @method initCrossDomain
 * @param {Object} app The express application
 * @private
 */
function initCrossDomain(app) {
	// setup CORS
	app.use(cors());
	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
		res.header("Access-Control-Allow-Credentials", 'true');
		res.header("X-Powered-By", ' 3.2.1');
		res.header("Content-Type", "application/json;charset=utf-8");
		if (req.method == 'OPTIONS') {
			res.sendStatus(200);
		} else {
			next();
		}
	});
}

/**
 *
 * @method initHistoryRoutes
 * @param {Object} app The express application
 * @private
 */
function initHistoryRoutes(app) {
	app.use(history({
		index: '/qu_elfront_service/index.html'
	}));
}
/**
 *
 * @method initErrorRoutes
 * @param {Object} app The express application
 * @private
 */
function initErrorRoutes(app) {
	app.use((err, req, res, next) => {
		if (!err) return next();
		console.error('Internal error(%d): %s', res.statusCode, err.stack);
		res.sendStatus(500);
	});

	app.use((req, res) => {
		res.sendStatus(404);
	});
}

/**
 *
 * @method init
 * @returns {Object} the express application
 */
function init() {
	// Initialize express app
	const app = express();

	// InitHistoryRoutes
	initHistoryRoutes(app);

	// Initialize Express middleware
	initMiddleware(app);

	// Initialize Helmet security headers
	initHelmetHeaders(app);

	// Initialize CORS
	initCrossDomain(app);

	// Initialize error routes
	initErrorRoutes(app);

	return app;
}

module.exports.init = init;
