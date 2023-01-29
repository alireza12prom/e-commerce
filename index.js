'use strict';

const server = require('./server');
const config = require('./config/server.config.json');

server.setup(config.development);
const http = server.start();

// set timeout
http.setTimeout(10000);
