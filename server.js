/**
 * Set up server for the app
 */
let express = require('express');
let path = require('path');

let app = express();

app.use(express.static(path.join(__dirname, 'dist', 'facial-recognition-app', 'browser')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'facial-recognition-app', 'browser', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
