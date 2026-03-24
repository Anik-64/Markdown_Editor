const express = require('express');
const app = express();
const path = require('path');

require('dotenv').config();

// set the view engine to ejs
// app.set('view engine', 'ejs');

// public folder to store assets
// app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('interface');
});

// app.listen(process.env.PORT || 8000, () => {
//     console.log(`Server is running ar port ${process.env.PORT}`);
// });

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => console.log(`Running locally on port ${process.env.PORT || 3000}`));
}

module.exports = app;