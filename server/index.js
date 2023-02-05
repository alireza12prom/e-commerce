'use strict';

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const route = require('./routes');
const { default: mongoose } = require('mongoose');
const { ErrorHandlerMiddleware } = require('./middleware');

class Server {
  constructor() {
    this.server = express();
    this.connnectionTries = 0;
  }

  setup(config) {
    this.server.set('env', config.env);
    this.server.set('port', config.port);
    this.server.set('host', config.host);

    this.server.use(bodyParser.json());
    this.server.use(logger('dev'));

    this.server.use('/', route);
    this.server.use(ErrorHandlerMiddleware.errorHandler);
  }

  start() {
    const host = this.server.get('host');
    const port = this.server.get('port');
    const app = this.server.listen(port, host);

    app.on('listening', async () => {
      mongoose.set('strictQuery', false);
      const URL = process.env.MONGO_URL;

      try {
        await mongoose.connect(URL);
        console.log('<< Mongo Connected >>');
        console.log(`Server: http://${host}:${port}`);
      } catch (error) {
        console.log('<< Faild to connect to mongodb');

        app.close();

        if (this.connnectionTries > 5) {
          console.log('<< Something went wrong, server closed >>');
        } else {
          console.log('>> try to reconnecting after 5s...');
          setTimeout(() => {
            app.listen(port, host);
          }, 5000);
          this.connnectionTries++;
        }
      }
    });
  }
}

module.exports = new Server();
