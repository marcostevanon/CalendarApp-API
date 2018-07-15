"use strict";
const app = require('express').Router();
const cfg = require('../config');
const mysql = require('mysql');
const moment = require('moment');
moment.locale('it');
var db = mysql.createPool(cfg.mysql);

app.get('/:course', (req, res) => {
    var query =
        `SELECT
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
            JOIN Room ON Times.id_room = Room.id
            JOIN Building ON Room.id_building = Building.id
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

module.exports = app;