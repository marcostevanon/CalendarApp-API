"use strict";
module.exports.mysql = {
    connectionLimit: process.env.MYSQL_CONN_LIMIT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    debug: false,
    timezone: 'UTC'
};