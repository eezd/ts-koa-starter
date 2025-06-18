基于 [chenlong-io/ts-koa-starter](https://github.com/chenlong-io/ts-koa-starter) 二次开发

**大部分代码由 claude 完成**

如果想使用ORM，请用nestjs。我认为KOA就是用于快速开发的，有什么能比手写SQL更快呢？

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

> Tips

服务器上运行 better-sqlite3 可能会出现问题，原因是 pnpm 默认 不会自动运行构建脚本，但 better-sqlite3 需要编译 才能正常使用。

```sh
pnpm approve-builds
pnpm rebuild better-sqlite3
```
