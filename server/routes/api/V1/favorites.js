'use strict';

const { Router } = require('express');
const router = Router();

// controller
const {
  V1: { FavoriteController },
} = require('../../../controller').ApiController;

// middleware
const {
  ParamValidatorMiddleware,
  BodyValidatorMiddleware,
  ErrorHandlerMiddleware,
} = require('../../../middleware');

router
  .route('/')
  .all(ErrorHandlerMiddleware.allowedMethod(['GET', 'POST', 'DELETE']))
  .get(FavoriteController.getFavoritesList)
  .post(
    BodyValidatorMiddleware.validateObjectId(['productId']),
    FavoriteController.saveToFavorites
  )
  .delete(
    BodyValidatorMiddleware.validateObjectId(['productId']),
    FavoriteController.dropFromFavorites
  );

module.exports = router;
