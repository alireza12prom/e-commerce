'use strict';

require('dotenv');
require('express-async-errors');

const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const route = require('./routes');

class Server {
  constructor() {
    this.server = express();
  }

  /**
   *
   * @param {object} config
   * @returns {void}
   */
  setup(config) {
    this.server.set('env', config.env);
    this.server.set('port', config.port);
    this.server.set('host', config.host);

    this.server.use(bodyParser.json());
    this.server.use(logger('dev'));

    this.server.use('/', route);
  }

  /**
   *
   * @param {server}
   */
  start() {
    const host = this.server.get('host');
    const port = this.server.get('port');
    return this.server.listen(port, host, () =>
      console.log(`Server on: http://${host}:${port}`)
    );
  }
}

module.exports = new Server();
