import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET } from "@/config"

const secret = JWT_SECRET || "your-secret-key"
const expiresIn = JWT_EXPIRES_IN || "24h"

function generateToken(data) {
  return jwt.sign(data, secret, {
    expiresIn: expiresIn as any
  })
}

async function verifyAuth(ctx, next) {
  const authHeader = ctx.request.headers.authorization
  if (!authHeader) {
    // 如果没有 Authorization 头，返回 401 错误
    ctx.status = 200
    ctx.body = { code: 401, message: "Authorization header is missing" }
    return
  }
  // Authorization 头通常是 'Bearer <token>'
  const token = authHeader.split(" ")[1]
  if (!token) {
    ctx.status = 200
    ctx.body = { code: 401, message: "Token is missing" }
    return
  }
  try {
    // 验证 token
    const decoded = jwt.verify(token, secret)
    ctx.state.user = decoded // 将解码后的用户信息存储在 ctx.state.user 中
    await next() // 如果认证通过，继续执行下一个中间件或路由处理
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (err) {
    ctx.status = 200
    ctx.body = { code: 401, message: "Invalid or expired token" }
  }
}

function getTokenData(ctx) {
  try {
    return jwt.decode(ctx.request.headers.authorization.split(" ")[1], {
      complete: true
    })
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`)
  }
}

export { generateToken, getTokenData, verifyAuth }
