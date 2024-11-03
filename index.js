const express = require('express');
const helmet = require('helmet');
const app = express();

require('dotenv').config();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(
    helmet.contentSecurityPolicy({
        directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://vercel.live"],
        // Add other sources as needed
        },
    })
);


// public folder to store assets
app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.render('interface');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running ar port ${process.env.PORT}`);
});