const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const { getNews } = require("../controllers/news");

router.get('/', auth, getNews);

module.exports = router;
