'use strict';

const { Router } = require('express');
const router = Router();

// controller
const {
  V1: { DiscountController },
} = require('../../../controller').ApiController;

// middlewares
const {
  BodyValidatorMiddleware,
  ErrorHandlerMiddleware,
  AuthenticationMiddleware,
} = require('../../../middleware');

router
  .route('/')
  .all(
    ErrorHandlerMiddleware.allowedMethod(['GET', 'POST', 'DELETE']),
    AuthenticationMiddleware.hashRole('admin')
  )
  .get(DiscountController.getDiscounts)
  .post(
    BodyValidatorMiddleware.validateBodyOnAddDiscount,
    DiscountController.addDiscount
  )
  .delete(
    BodyValidatorMiddleware.validateObjectId(['discountId']),
    DiscountController.expireDiscount
  );

module.exports = router;
