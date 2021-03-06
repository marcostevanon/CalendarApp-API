"use strict";

// Import environments
require('dotenv').config();

const app = require('express')();
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql');
const moment = require('moment');
moment.locale('it');
var db = mysql.createPool(require(__dirname + '/config.js').mysql);

app.use(cors())
app.use(morgan(':date[iso] [:response-time[digits]ms] :remote-addr :method :url :status \t :referrer'));

app.get('/course/list', (req, res) => {
    var query = `
            SELECT name, csvCode, year, active
            FROM Course
            ORDER BY year`;

    db.query(query, [], (err, rows) => {
        if (err) res.sendStatus(500);
        res.json(rows);
    });
});

app.get('/course/:course', (req, res) => {
    var query = `
            SELECT * 
            FROM Course WHERE csvCode = ?`;
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
    var query = `
            SELECT date
            FROM log
            WHERE courseCode = ?
            AND times > 0
            ORDER BY date DESC
            LIMIT 1`;
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
    var query = `
            SELECT Times.id         AS id,
                Times.webID      AS webID,
                Course.name      AS courseName,
                Times.moduleName AS moduleName,
                Times.required   AS required,
                Professor.name   AS prof,
                Room.name        AS room,
                Building.name    AS building,
                Times.date       AS date,
                Times.timestart  AS timestart,
                Times.timeend    AS timeend,
                Times.note       AS note
            FROM Times
                JOIN Course ON Times.id_course = Course.id
                JOIN Professor ON Times.id_professor = Professor.id
                LEFT JOIN Room ON Times.id_room = Room.id
                LEFT JOIN Building ON Room.id_building = Building.id
            WHERE Course.csvCode = ?
            AND Times.date >= ?
            ORDER BY Times.date, Times.timestart`;
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

app.get('/log', (req, res) => {
    var query = `
            SELECT *
            FROM log
            WHERE action = 'check'
            OR action = 'update'
            OR action = 'new'
            OR action = 'delete'
            ORDER BY date DESC
            LIMIT ?`;

    var args = [];
    try {
        if (req.query.limit) args.push(parseInt(req.query.limit));
        else args.push(200);
    } catch (error) {
        res.sendStatus(500);
        return;
    }

    db.query(query, args, (err, rows) => {
        console.log(err);
        if (err) res.sendStatus(500);
        else res.json(rows);

    });
})

app.get('/mail', (req, res) => {
    var query = `
            SELECT *
            FROM log
            WHERE action = 'mailSEND'
            OR action = 'mailERROR'
            ORDER BY date DESC
            LIMIT ?`;

    var args = [];
    try {
        if (req.query.limit) args.push(parseInt(req.query.limit));
        else args.push(200);
    } catch (error) {
        res.sendStatus(500);
        return;
    }

    db.query(query, args, (err, rows) => {
        console.log(err);
        if (err) res.sendStatus(500);
        else res.json(rows);

    });
})

app.get('/stats/:course', (req, res) => {
    var query = `
            SELECT Times.moduleName                                                AS module,
                GROUP_CONCAT(DISTINCT Professor.name ORDER BY Professor.name, ',') AS prof,
                FLOOR(SUM((Times.timeend - Times.timestart) / 10000))              AS duration
            FROM Course
                JOIN Times on Course.id = Times.id_course
                JOIN Professor on Times.id_professor = Professor.id
                JOIN Room on Times.id_room = Room.id
                JOIN Building on Room.id_building = Building.id
            WHERE Course.csvCode = ?
            GROUP BY module
            ORDER BY module;`;
    var args = [];

    if (req.params.course) {
        args.push(req.params.course);

        db.query(query, args, (err, rows) => {
            if (err) { res.sendStatus(500); }
            res.json(rows);
        });
    } else { res.sendStatus(400); }
});

app.all("/healthcheck", (req, res) => res.sendStatus(200));
app.all('*', (req, res) => res.sendStatus(404));

var port = 1883;
app.listen(port, () => console.log('listen on port ' + port));