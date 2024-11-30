const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  const svelteBuildPath = path.join(__dirname, '../../build/index.html'); // Svelte 빌드 파일 경로
  res.sendFile(svelteBuildPath);
});

module.exports = router;
