const express = require('express');
const helmet = require('helmet');
const app = express();

require('dotenv').config();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(
    helmet({
        contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://vercel.live"],
            scriptSrcElem: ["'self'", "https://vercel.live"], // For inline scripts in elements
            connectSrc: ["'self'", "https://vercel.live"],    // For WebSocket or API calls
            styleSrc: ["'self'", "'unsafe-inline'"],          // Adjust as needed for CSS styles
            imgSrc: ["'self'", "data:"],                      // Allow images from same origin
            frameSrc: ["'self'"],                             // Allow iframes from self if needed
            // Add other directives as needed
        },
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