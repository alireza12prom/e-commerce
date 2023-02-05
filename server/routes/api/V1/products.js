'use strict';

const { Router } = require('express');
const router = Router();

// product controller
const {
  V1: { ProductController },
} = require('../../../controller').ApiController;

// middleware
const {
  ParamValidatorMiddleware,
  QueryValidatorMiddleware,
  BodyValidatorMiddleware,
  ErrorHandlerMiddleware,
  AuthenticationMiddleware,
} = require('../../../middleware');

router
  .route('/')
  .all(ErrorHandlerMiddleware.allowedMethod(['GET', 'DELETE', 'POST']))
  .get(
    QueryValidatorMiddleware.ValidatequeriesOnGetAllProducts,
    ProductController.getAll
  )
  .delete(
    AuthenticationMiddleware.hashRole('admin'),
    BodyValidatorMiddleware.validateObjectId(['productId']),
    ProductController.deleteOne
  )
  .post(
    AuthenticationMiddleware.hashRole('admin'),
    BodyValidatorMiddleware.validateBodyOnNewProduct,
    ProductController.createOne
  );

router
  .route('/:productId')
  .all(ErrorHandlerMiddleware.allowedMethod(['GET', 'PATCH']))
  .get(ProductController.getOne)
  .patch(
    AuthenticationMiddleware.hashRole('admin'),
    BodyValidatorMiddleware.validateBodyOnUpdateProduct,
    ProductController.updateOne
  );

router.param(
  'productId',
  ParamValidatorMiddleware.validateObjectId('productId')
);

module.exports = router;
