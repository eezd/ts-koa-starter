基于 [chenlong-io/ts-koa-starter](https://github.com/chenlong-io/ts-koa-starter) 二次开发

**大部分代码由 claude 完成**

如果想使用OEM，请用nestjs。我认为KOA就是用于快速开发的，有什么能比手写SQL更快呢？

新增文件上传，JWT，登录，权限校验，重新封装了 PostgreSQL Mysql Sqlite。

代码格式化采用 [@antfu/eslint-config](https://github.com/antfu/eslint-config)

需自行创建 .env.development / .env.production

```env
PORT=3000

SITE=http://localhost:3000

PG_HOST=
PG_PORT=5432
PG_USER=
PG_PASSWORD=
PG_DB_NAME=

MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DB_NAME=
```

package.json

```json
{
  "dependencies": {
    "@koa/multer": "^3.0.2",
    "@koa/router": "^13.1.0",
    "dotenv": "^16.4.7",
    "inversify": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "koa": "^2.16.0",
    "koa-bodyparser": "^4.4.1",
    "koa-helmet": "^8.0.1",
    "koa-json": "^2.0.2",
    "koa-logger": "^3.2.1",
    "koa-static": "^5.0.0",
    "koa2-cors": "^2.0.6",
    "multer": "1.4.5-lts.1",
    "pg": "^8.7.1",
    "reflect-metadata": "^0.2.2",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@antfu/eslint-config": "3.14.0",
    "@types/koa": "^2.15.0",
    "@types/koa-bodyparser": "^4.3.12",
    "@types/koa-router": "^7.4.8",
    "@types/node": "^22.13.5",
    "@types/pg": "^8.7.1",
    "eslint-plugin-format": "^1.0.1",
    "nodemon": "^3.1.9",
    "pm2": "^5.4.3",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3"
  }
}
```

> Tips

服务器上运行 better-sqlite3 可能会出现问题，原因是 pnpm 默认 不会自动运行构建脚本，但 better-sqlite3 需要编译 才能正常使用。

```sh
pnpm approve-builds
pnpm rebuild better-sqlite3
```
