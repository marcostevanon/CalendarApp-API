"use strict";
const app = require('express')();
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql');
const moment = require('moment');
moment.locale('it');
var db = mysql.createPool(require(__dirname + '/config.js').mysql);

app.use(cors())
app.use(morgan('combined'));

app.get('/course/list', (req, res) => {
    var query = `SELECT name, csvCode, year, active FROM Course ORDER BY year`;

    db.query(query, [], (err, rows) => {
        if (err) res.sendStatus(500);
        res.json(rows);
    });
});

app.get('/course/:course', (req, res) => {
    var query = `SELECT * FROM Course WHERE csvCode = ?`;
    var args = [];

    if (req.params.course) {
        args.push(req.params.course);

        db.query(query, args, (err, rows) => {
            if (err) { res.sendStatus(500); }
            res.json(rows[0]);
        });
    } else { res.sendStatus(400); }
});

app.get('/lastupdt/:course', (req, res) => {
    var query = `SELECT date FROM log WHERE courseCode = ? AND times > 0 ORDER BY date DESC LIMIT 1`;
    var args = [];

    if (req.params.course) {
        args.push(req.params.course);

        db.query(query, args, (err, rows) => {
            if (err) { res.sendStatus(500); }
            if (rows.length) res.json(rows[0].date);
            else res.sendStatus(400); 
        });
    } else { res.sendStatus(400); }
});

app.get('/times/:course', (req, res) => {
    var query = `SELECT
            Times.id         as id,
            Times.webID      as webID,
            Course.name      as courseName,
            Times.moduleName as moduleName,
            Times.required   as required,
            Professor.name   as prof,
            Room.name        as room,
            Building.name    as building,
            Times.date       as date,
            Times.timestart  as timestart,
            Times.timeend    as timeend,
            Times.note       as note
        FROM Times
            JOIN Course ON Times.id_course = Course.id
            JOIN Professor ON Times.id_professor = Professor.id
            LEFT JOIN Room ON Times.id_room = Room.id
            LEFT JOIN Building ON Room.id_building = Building.id
        WHERE Course.csvCode = ? AND Times.date >= ?`;
    var args = [];

    if (req.params.course) {
        args.push(req.params.course);

        if (req.query.date) { args.push(req.query.date); }
        else { args.push(moment().format('YYYY-MM-DD')); }

        db.query(query, args, (err, rows) => {
            if (err) { res.sendStatus(500); }
            res.json(rows);
        });
    } else { res.sendStatus(400); }
});

app.all('*', (req, res) => {
    res.sendStatus(404);
});

var server = app.listen(1883, () => {
    console.log('listen on port ' + server._connectionKey.split(':')[4]);
});

/*process.on('SIGINT', function () {
    server.close();
    console.log("\nserver closed");
});*/