/**
 * 该文件用于配置PM2
 * https://pm2.fenxianglu.cn/docs/general/configuration-file/
 */
const path = require("node:path")
const { name } = require("./package.json")

module.exports = {
  apps: [
    {
      name,
      script: path.resolve(__dirname, "./dist/index.js"),
      instances: require("node:os").cpus().length,
      autorestart: true,
      watch: true,
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
}
