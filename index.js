'use strict';

const server = require('./server');
const config = require('./config/server.config.json');

server.setup(config.development);
server.start();
