const express = require('express');

const jsonLimiter = express.json({ limit: '50kb' });

const validateRequestBodySize = (req, res, next) => {
  if (req.get('Content-Length') && parseInt(req.get('Content-Length')) > jsonLimiter.limit) {
    return res.status(400).json({ error: 'Request body too large' });
  }
  next();
};

module.exports = { jsonLimiter, validateRequestBodySize };
