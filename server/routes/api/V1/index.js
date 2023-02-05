'use strict';

const { Router } = require('express');
const router = Router();
const { AuthenticationMiddleware } = require('../../../middleware');

router.use('/register', require('./register'));

router.use(AuthenticationMiddleware.authenticationUser);

router.use('/products', require('./products'));
router.use('/comments', require('./comments'));
router.use('/favorites', require('./favorites'));
router.use('/orders', require('./orders'));
router.use('/discounts', require('./discounts'));

module.exports = router;
