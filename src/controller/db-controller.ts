/**
 * Controller用于接受数据、返回数据给前端
 */
import type { Context } from "koa"
import Router from "@koa/router"
import mysql from "@/utils/mysql"
import pg from "@/utils/pg"
import sqlite from "@/utils/sqlite"

const router = new Router({
  prefix: "/db"
})

router.get("/pg/query", async (ctx: Context) => {
  const result = await pg.query(`
    SELECT * FROM books LIMIT 5
    `)
  if (result.length === 0) {
    ctx.body = { code: 400, message: "用户不存在" }
  } else {
    ctx.body = { code: 200, message: "查询成功", data: result }
  }
})

router.get("/mysql/query", async (ctx: Context) => {
  const result = await mysql.query(`
    SELECT * FROM user LIMIT 5
    `)
  if (result.length === 0) {
    ctx.body = { code: 400, message: "用户不存在" }
  } else {
    ctx.body = { code: 200, message: "查询成功", data: result }
  }
})

// 查询用户
router.get("/sqlite/query", async (ctx: Context) => {
  const result = await sqlite.query("SELECT * FROM user")
  if (result.length === 0) {
    ctx.body = { code: 400, message: "用户不存在" }
  } else {
    ctx.body = { code: 200, message: "查询成功", data: result }
  }
})

// 查询单个用户
router.get("/sqlite/query/:id", async (ctx: Context) => {
  const id = Number.parseInt(ctx.params.id)
  const result = await sqlite.queryOne("SELECT * FROM user WHERE id = ?", id)
  if (!result) {
    ctx.body = { code: 400, message: "用户不存在" }
  } else {
    ctx.body = { code: 200, message: "查询成功", data: result }
  }
})

// 创建用户
router.post("/sqlite/add", async (ctx) => {
  const { name } = ctx.request.body as any
  if (!name) {
    ctx.status = 400
    ctx.body = { error: "姓名必填" }
    return
  }
  const result = await sqlite.execute(
    "INSERT INTO user (name) VALUES (?)",
    [name]
  )
  ctx.body = {
    code: 200,
    message: "创建成功",
    data: {
      id: Number(result.lastInsertRowid),
      name
    }
  }
})

// 事务示例 - 创建用户和他的初始任务
router.post("/sqlite/with-tasks", async (ctx) => {
  const { name, tasks } = ctx.request.body as any

  if (!name || !Array.isArray(tasks)) {
    ctx.status = 400
    ctx.body = { error: "Name and tasks array are required" }
    return
  }

  const result = await sqlite.transaction((db) => {
    // 在事务中插入用户
    const userStmt = db.prepare("INSERT INTO user (name) VALUES (?)")
    const userResult = userStmt.run(name)
    const userId = userResult.lastInsertRowid

    // 在事务中批量插入任务
    const taskStmt = db.prepare("INSERT INTO tasks (uid, title) VALUES (?, ?)")
    for (const task of tasks) {
      taskStmt.run(userId, task.title)
    }

    return userId
  })

  ctx.body = {
    code: 200,
    message: "User and tasks created successfully",
    userId: Number(result)
  }
})

export default router
