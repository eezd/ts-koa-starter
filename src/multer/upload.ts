import fs from "node:fs"
import path from "node:path"
import multer from "@koa/multer"

// 确保上传目录存在
const uploadDir = "public/uploads"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 文件存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir) // 存储目录
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, filename)
  }
})

// 配置文件上传
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})
