const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { uploadAndPredict, getHistory, deletePrediction } = require("../controllers/modelAi");
const Multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = Multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), auth, uploadAndPredict);
router.get('/history', auth, getHistory);
router.delete('/predictions/:id', auth, deletePrediction);

module.exports = router;
