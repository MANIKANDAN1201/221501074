const express = require('express');
const logger = require('./middleware/logger');
const shorturlRoutes = require('./routes/shorturl');

const app = express();

app.use(express.json());
app.use(logger);

app.use('/shorturl', shorturlRoutes);

module.exports = app;