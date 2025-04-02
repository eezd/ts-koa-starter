// import type { Database, Statement } from "better-sqlite3"
// import type { Connection, PoolClient, QueryConfig } from "pg"
// import type { MySQLQueryResult } from "./utils/mysql"
// import type { SQLiteQueryResult } from "./utils/sqlite"

// declare module "koa" {
//   interface Context {
//     pg: {
//       query: <T = any>(query: string | QueryConfig, values?: any[]) => Promise<T[]>
//       queryOne: <T = any>(query: string | QueryConfig, values?: any[]) => Promise<T | null>
//       execute: <T = any>(query: string | QueryConfig, values?: any[]) => Promise<{ rowCount: number, rows: T[] }>
//       batch: <T = any>(query: string | QueryConfig, valuesArray: any[][]) => Promise<{ rowCount: number, rows: T[] }>
//       transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>
//       getPoolStatus: () => { totalCount: number, idleCount: number, waitingCount: number }
//     }

//     sqlite: {
//       query: <T = any>(sql: string, params?: any) => T[]
//       queryOne: <T = any>(sql: string, params?: any) => T | undefined
//       execute: (sql: string, params?: any) => SQLiteQueryResult
//       batch: (sql: string, paramsArray: any[]) => SQLiteQueryResult
//       transaction: <T>(callback: (db: Database) => T) => T
//       prepare: (sql: string) => Statement
//       getInstance: () => Database
//     }

//     mysql: {
//       query: <T = any>(sql: string, params?: any) => Promise<T[]>
//       queryOne: <T = any>(sql: string, params?: any) => Promise<T | null>
//       execute: (sql: string, params?: any) => Promise<MySQLQueryResult>
//       batch: (sql: string, paramsArray: any[]) => Promise<MySQLQueryResult>
//       transaction: <T>(callback: (connection: Connection) => Promise<T>) => Promise<T>
//       callProcedure: <T = any>(procedureName: string, params?: any[]) => Promise<T[]>
//       getPoolStatus: () => Promise<{ threadId: number, config: any }>
//     }
//   }
// }
