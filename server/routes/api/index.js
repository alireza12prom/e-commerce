'use strict';

const { Router } = require('express');
const router = Router();

router.use('/v1', require('./V1'));

module.exports = router;
