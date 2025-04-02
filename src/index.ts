import type AppError from "./exception/app-error"
import path from "node:path"
import Koa from "koa"
import cors from "koa2-cors"
import bodyParser from "koa-bodyparser"
import helmet from "koa-helmet"
import json from "koa-json"
import logger from "koa-logger"
import koaStatic from "koa-static"
import { PORT } from "./config"
// import databaseMiddleware from "./middleWare/databaseMiddleware"
import routes from "./routes"

const app = new Koa()

const publicPath = path.join(__dirname, "..", "public")
console.log(`Serving static files from: ${publicPath}`)
// 只在 "/public" 开头的路径查找静态文件
app.use(async (ctx, next) => {
  if (ctx.path.startsWith("/public")) {
    ctx.path = ctx.path.replace("/public", "") // 去掉 "/public" 前缀
    return koaStatic(publicPath)(ctx, next) // 让 koa-static 处理
  }
  await next()
})

app.use(logger())

app.use(bodyParser())

// app.use(databaseMiddleware)

// ================= 全局错误处理中间件 =================
app.use(async (ctx: Koa.Context, next: () => Promise<void>) => {
  try {
    await next()
  } catch (err) {
    // 类型守卫
    const error = err as AppError | Error
    // 记录错误日志
    ctx.app.emit("error", error, ctx)
    // 标准化错误响应
    // ctx.status = "statusCode" in error ? error.statusCode : 500
    ctx.status = 200
    ctx.body = {
      code: "code" in error ? error.code : "INTERNAL_ERROR",
      message: error.message || "Internal Server Error"
    }
  }
})

// ================= 全局错误事件监听 =================
app.on("error", (err: Error, ctx: Koa.Context) => {
  // 这里可以集成日志系统（如 Winston）
  console.error("[Global Error]", {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    path: ctx.path,
    status: ctx.status,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    }
  })
})

// ================= 处理未捕获的 Promise Rejection =================
process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
    // 可以在这里进行错误上报
  }
)

// ================= 处理未捕获的异常 =================
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err)
  // 建议记录错误后关闭进程
  // process.exit(1)
})

// 返回格式 JSON
app.use(json())
// 跨域
app.use(cors())
// 增加应用的安全性
app.use(helmet())

app.use(routes.routes()).use(routes.allowedMethods())

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
