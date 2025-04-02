import Router from "@koa/router"
import dbController from "./controller/db-controller"
import homeController from "./controller/home-controller"
import loginController from "./controller/login.controller"

const router = new Router()

router.use(homeController.routes()).use(homeController.allowedMethods())
router.use(dbController.routes()).use(dbController.allowedMethods())
router.use(loginController.routes()).use(loginController.allowedMethods())

export default router
