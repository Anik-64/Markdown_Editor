const express = require('express');
const app = express();

require('dotenv').config();

// set the view engine to ejs
app.set('view engine', 'ejs');

// public folder to store assets
app.use(express.static('./public'));

// routes for app
app.get('/', (req, res) => {
    res.render('interface');
});

// listen on port 8000 (for localhost) or the port defined for heroku
app.listen(process.env.PORT, () => {
    console.log(`Server is running ar port ${process.env.PORT}`);
});