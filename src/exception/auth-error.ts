import AppError from "./app-error"

// 可以扩展 AppError 处理常见错误类型
export default class AuthError extends AppError {
  constructor() {
    super("权限不足", 401)
  }
}
