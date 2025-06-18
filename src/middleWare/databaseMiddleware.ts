// import type Koa from "koa"
// import mysql from "@/utils/mysql"
// import pg from "../utils/pg"
// import sqlite from "../utils/sqlite"

// async function databaseMiddleware(ctx: Koa.Context, next: Koa.Next) {
//   ctx.pg = {
//     query: pg.query.bind(pg),
//     queryOne: pg.queryOne.bind(pg),
//     execute: pg.execute.bind(pg),
//     batch: pg.batch.bind(pg),
//     transaction: pg.transaction.bind(pg),
//     getPoolStatus: pg.getPoolStatus.bind(pg)
//   }

//   ctx.sqlite = {
//     query: sqlite.query.bind(sqlite),
//     queryOne: sqlite.queryOne.bind(sqlite),
//     execute: sqlite.execute.bind(sqlite),
//     batch: sqlite.batch.bind(sqlite),
//     transaction: sqlite.transaction.bind(sqlite),
//     prepare: sqlite.prepare.bind(sqlite),
//     getInstance: () => sqlite.instance
//   }

//   // MySQL 客户端
//   ctx.mysql = {
//     query: mysql.query.bind(mysql),
//     queryOne: mysql.queryOne.bind(mysql),
//     execute: mysql.execute.bind(mysql),
//     batch: mysql.batch.bind(mysql),
//     transaction: mysql.transaction.bind(mysql),
//     callProcedure: mysql.callProcedure.bind(mysql),
//     getPoolStatus: mysql.getPoolStatus.bind(mysql)
//   }

//   await next()
// }

// export default databaseMiddleware
