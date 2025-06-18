import * as dotenv from "dotenv"

dotenv.config(({ path: `.env.${process.env.NODE_ENV || "development"}` }))

export const { PORT, SITE, PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DB_NAME, MYSQL_DB_NAME, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_USER } = process.env
export const { JWT_SECRET, JWT_EXPIRES_IN } = process.env
export const NODE_ENV = process.env.NODE_ENV
