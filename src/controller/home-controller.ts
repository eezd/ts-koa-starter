/**
 * Controller用于接受数据、返回数据给前端
 */
import type { Context } from "koa"
import Router from "@koa/router"
import { SITE } from "@/config"
import { upload } from "@/multer/upload"
import homeService from "../service/home-service"

const router = new Router()
const a = function () {
  console.log("a")
}
router.get("/", async (ctx: Context) => {
  const res = await homeService.hello()
  ctx.body = res
})

router.post(
  "/upload",
  upload.fields([
    { name: "photos", maxCount: 10 }
  ]),
  async (ctx) => {
    const photoPaths = []
    if (ctx.files && ctx.files.photos) {
      ctx.files.photos.forEach((file) => {
        const fixedPath = file.path.replace(/\\/g, "/")
        const relativePath = fixedPath.startsWith("public") ? `/${fixedPath}` : `/public/${fixedPath}`
        photoPaths.push({
          locPath: relativePath,
          urlPath: `${SITE}${relativePath}`
        })
      })
    }
    ctx.body = { code: 200, message: "成功", data: photoPaths }
  }
)

/**
 * 接收name处理后返回给前端
 * @param ctx
 */
export async function helloName(ctx: Context) {
  const { name } = ctx.params
  const res = await homeService.helloName(name)
  ctx.body = res
}

/**
 * 返回query参数
 * 如：/info?name=jack&age=32
 * ctx.query => { name: 'jack', age: '32' }
 * @param ctx
 */
export async function getPersonInfo(ctx: Context) {
  const queryParams = ctx.query
  const res = await homeService.getPersonInfo(queryParams)
  ctx.body = res
}

/**
 * 接收post请求，并获取参数
 * @param ctx
 */
export async function postTest(ctx: Context) {
  const params = ctx.request.body
  const res = await homeService.postTest(params)
  ctx.body = res
}

export default router
