import AppError from "@/exception/app-error"
import { generateToken } from "@/utils/jwt"

/**
 * Service用来处理逻辑，返回结果给Controller
 */
class HomeService {
  login(username, password) {
    return new Promise((resolve, reject) => {
      console.log(username, password)
      if (username === "admin" && password === "123456") {
        resolve(generateToken({ username: "admin" }))
      } else {
        reject(new AppError("用户名或密码错误"))
      }
    })
  }
}

export default new HomeService()
