'use strict';

const { Router } = require('express');
const router = Router();

// controller
const {
  V1: { CommentController },
} = require('../../../controller').ApiController;

// middlewares
const {
  ParamValidatorMiddleware,
  BodyValidatorMiddleware,
  ErrorHandlerMiddleware,
} = require('../../../middleware');

router
  .route('/')
  .all(ErrorHandlerMiddleware.allowedMethod(['POST', 'DELETE', 'PATCH']))
  .post(
    BodyValidatorMiddleware.validateBodyOnNewComment,
    CommentController.sendAComment
  )
  .delete(
    BodyValidatorMiddleware.validateObjectId(['productId']),
    CommentController.deleteAComment
  )
  .patch(
    BodyValidatorMiddleware.validateBodyOnUpdateComment,
    CommentController.updateAComment
  );

router
  .route('/feedback')
  .all(ErrorHandlerMiddleware.allowedMethod(['POST', 'DELETE']))
  .post(
    BodyValidatorMiddleware.validateBodyOnSendCommentFeedback,
    CommentController.sendFeedback
  )
  .delete(
    BodyValidatorMiddleware.validateObjectId(['commentId']),
    CommentController.deleteFeedback
  );

router
  .route('/:productId')
  .all(ErrorHandlerMiddleware.allowedMethod(['GET']))
  .get(CommentController.getComments);

router.param(
  'productId',
  ParamValidatorMiddleware.validateObjectId('productId')
);

module.exports = router;
