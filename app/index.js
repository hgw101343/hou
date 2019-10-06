const path = require('path');
const colors = require('colors');
const express = require('./express');
const config = require('./default');

const app = express.init();

// 监听端口，启动程序
const server = app.listen(config.port, () => {
	console.log('server start listen：' + config.port);
});
module.exports = app;
