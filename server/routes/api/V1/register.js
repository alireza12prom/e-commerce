'use strict';

const { Router } = require('express');
const router = Router();

const { RegisterController } = require('../../../controller/api/V1');
const { BodyValidatorMiddleware } = require('../../../middleware');

router.post(
  '/',
  BodyValidatorMiddleware.validateBodyOnRegisterUser,
  RegisterController.register
);

router.post(
  '/new-apikey',
  BodyValidatorMiddleware.validateBodyOnGetNewApiKey,
  RegisterController.refreshApikey
);

module.exports = router;
