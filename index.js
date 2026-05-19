const express = require('express');
const app = express();
const path = require('path');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

app.use(helmet({
    contentSecurityPolicy: false,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('interface');
});

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => console.log(`Running locally on port ${process.env.PORT || 3000}`));
}

module.exports = app;