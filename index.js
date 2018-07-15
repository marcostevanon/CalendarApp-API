"use strict";
const app = require('express')();
const morgan = require('morgan');

app.use(morgan('combined'));

app.use('/times', require(__dirname + '/routes/times.js'));

app.all('*', (req, res) => {
    res.sendStatus(404);
});

var server = app.listen(3000, () => {
    console.log('listen on port ' + server._connectionKey.split(':')[4]);
});

/*process.on('SIGINT', function () {
    server.close();
    console.log("\nserver closed");
});*/