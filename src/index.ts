import type { Context, Next } from "koa"
import type AppError from "./exception/app-error"
import path from "node:path"
import cors from "@koa/cors"
import Koa from "koa"
import bodyParser from "koa-bodyparser"
import json from "koa-json"
import logger from "koa-logger"
import koaStatic from "koa-static"
import { NODE_ENV, PORT } from "./config"
// import databaseMiddleware from "./middleWare/databaseMiddleware"
import routes from "./routes"

const app = new Koa()

app.use(logger())
app.use(cors())
app.use(bodyParser())
app.use(json())

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

// app.use(databaseMiddleware)

// ================= 全局错误处理中间件 =================
app.use(async (ctx: Context, next: Next) => {
  try {
    await next()

    // 处理404情况
    if (ctx.status === 404) {
      ctx.status = 200
      ctx.body = {
        code: "NOT_FOUND",
        message: "Resource not found"
      }
    }
  } catch (err) {
    const error = err as AppError | Error

    // 发送错误事件
    ctx.app.emit("error", error, ctx)

    // 统一错误响应格式
    const isAppError = "code" in error && "statusCode" in error

    ctx.status = 200 // 或者使用实际HTTP状态码
    ctx.body = {
      success: false,
      code: isAppError ? (error as AppError).code : "INTERNAL_ERROR",
      message: error.message || "Internal Server Error",
      ...(NODE_ENV !== "production" && { stack: error.stack })
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

// ================= 进程错误处理 =================
function setupProcessHandlers() {
  process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
    console.error("Unhandled Rejection detected:", {
      timestamp: new Date().toISOString(),
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined
    })

    // 在生产环境可能需要退出进程
    if (NODE_ENV === "production") {
      console.error("Process will exit due to unhandled rejection")
      process.exit(1)
    }
  })

  process.on("uncaughtException", (err: Error) => {
    console.error("Uncaught Exception detected:", {
      timestamp: new Date().toISOString(),
      name: err.name,
      message: err.message,
      stack: err.stack
    })

    // 记录错误后优雅退出
    process.exit(1)
  })

  // 优雅关闭处理
  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}, starting graceful shutdown...`)

    // 这里可以添加清理逻辑
    // 例如：关闭数据库连接、完成正在处理的请求等

    process.exit(0)
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
  process.on("SIGINT", () => gracefulShutdown("SIGINT"))
}

setupProcessHandlers()

app.use(routes.routes())
app.use(routes.allowedMethods())

// 启动服务器
async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`🌍 Environment: ${NODE_ENV}`)
      console.log(`📦 Node.js version: ${process.version}`)
      console.log(`🔧 Process ID: ${process.pid}`)
    })

    // 设置服务器配置
    server.timeout = 30000 // 30秒超时
    server.keepAliveTimeout = 65000 // Keep-alive 超时
    server.headersTimeout = 66000 // 头部超时（应该比 keepAliveTimeout 大）

    return server
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
