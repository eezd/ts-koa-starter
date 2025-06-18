/**
 * Controller用于接受数据、返回数据给前端
 */
import type { Context } from "koa"
import Router from "@koa/router"
import { verifyAuth } from "@/utils/jwt"
import loginService from "../service/login-service"

const router = new Router()

router.post("/login", async (ctx: Context) => {
  const { username, password } = ctx.request.body as {
    username: string
    password: string
  }
  const res = await loginService.login(username, password)
  if (res) {
    ctx.body = { code: 200, msg: "Login successful", data: { token: res } }
  }
})

router.get("/authTest", verifyAuth, async (ctx) => {
  ctx.body = { code: 200, msg: "授权成功" }
})
export default router
