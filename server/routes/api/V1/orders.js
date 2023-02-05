'use strict';

const { Router } = require('express');
const router = Router();

// controller
const {
  V1: { OrderController },
} = require('../../../controller').ApiController;

// middleware
const {
  BodyValidatorMiddleware,
  ErrorHandlerMiddleware,
} = require('../../../middleware');

router
  .route('/')
  .all(ErrorHandlerMiddleware.allowedMethod(['GET', 'POST', 'DELETE']))
  .get(OrderController.getOrdersList)
  .post(
    BodyValidatorMiddleware.validateBodyOnNewOrder,
    OrderController.saveToOrders
  )
  .delete(
    BodyValidatorMiddleware.validateObjectId(['orderId']),
    OrderController.deleteFromOrders
  );

module.exports = router;
