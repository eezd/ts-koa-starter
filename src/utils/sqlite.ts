import type { Database as SQLiteDatabase, Statement } from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"

// 定义SQLite数据库配置类型
interface SQLiteConfig {
  filename: string
  readonly?: boolean
  fileMustExist?: boolean
  timeout?: number
  verbose?: boolean | ((message?: any, ...additionalArgs: any[]) => void)
}

// 定义查询结果类型
export interface SQLiteQueryResult<T = any> {
  changes: number
  lastInsertRowid: number | bigint
  data?: T[]
}

export class SQLiteWrapper {
  private db: SQLiteDatabase
  private static instance: SQLiteWrapper

  private constructor(config: SQLiteConfig) {
    try {
      this.db = new Database(config.filename, {
        readonly: config.readonly || false,
        fileMustExist: config.fileMustExist || false,
        timeout: config.timeout || 5000,
        verbose: config.verbose || false
      })

      // 启用外键约束
      this.db.pragma("foreign_keys = ON")

      // 设置日志模式
      // if (process.env.NODE_ENV !== "production") {
      //   this.db.pragma("journal_mode = WAL")
      // }
    } catch (err) {
      console.error("SQLite database initialization error:", err)
      throw err
    }
  }

  // 单例模式
  public static getInstance(config?: SQLiteConfig): SQLiteWrapper {
    if (!SQLiteWrapper.instance) {
      if (!config) {
        throw new Error("SQLite configuration required")
      }
      SQLiteWrapper.instance = new SQLiteWrapper(config)
    }
    return SQLiteWrapper.instance
  }

  /**
   * 执行查询并返回所有匹配的行
   * @param sql SQL查询语句
   * @param params 参数对象或数组
   */
  public query<T = any>(sql: string, params?: any): T[] {
    try {
      const start = Date.now()
      const stmt = this.db.prepare(sql)
      const result = params ? stmt.all(params) : stmt.all()
      const duration = Date.now() - start
      console.log(`Executed query in ${duration}ms`)
      return result as T[]
    } catch (err) {
      console.error(`Error executing query: ${sql}`, err)
      throw err
    }
  }

  /**
   * 执行查询并只返回第一行
   * @param sql SQL查询语句
   * @param params 参数对象或数组
   */
  public queryOne<T = any>(sql: string, params?: any): T | undefined {
    try {
      const start = Date.now()
      const stmt = this.db.prepare(sql)
      const result = params ? stmt.get(params) : stmt.get()
      const duration = Date.now() - start
      console.log(`Executed queryOne in ${duration}ms`)
      return result as T | undefined
    } catch (err) {
      console.error(`Error executing queryOne: ${sql}`, err)
      throw err
    }
  }

  /**
   * 执行修改操作（INSERT, UPDATE, DELETE等）
   * @param sql SQL语句
   * @param params 参数对象或数组
   */
  public execute(sql: string, params?: any): SQLiteQueryResult {
    try {
      const start = Date.now()
      const stmt = this.db.prepare(sql)
      const result = params ? stmt.run(params) : stmt.run()
      const duration = Date.now() - start
      console.log(`Executed statement in ${duration}ms`)
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid
      }
    } catch (err) {
      console.error(`Error executing statement: ${sql}`, err)
      throw err
    }
  }

  /**
   * 执行批量操作
   * @param sql SQL语句
   * @param paramsArray 参数数组的数组
   */
  public batch(sql: string, paramsArray: any[]): SQLiteQueryResult {
    try {
      const start = Date.now()
      const stmt = this.db.prepare(sql)
      let changes = 0
      let lastInsertRowid: number | bigint = 0

      const transaction = this.db.transaction((items) => {
        for (const params of items) {
          const result = stmt.run(params)
          changes += result.changes
          if (result.lastInsertRowid) {
            lastInsertRowid = result.lastInsertRowid
          }
        }
      })

      transaction(paramsArray)

      const duration = Date.now() - start
      console.log(`Executed batch in ${duration}ms`)

      return {
        changes,
        lastInsertRowid
      }
    } catch (err) {
      console.error(`Error executing batch operation: ${sql}`, err)
      throw err
    }
  }

  /**
   * 执行事务
   * @param callback 事务回调函数
   */
  public transaction<T>(callback: (db: SQLiteDatabase) => T): T {
    const transaction = this.db.transaction((db: SQLiteDatabase) => {
      return callback(db)
    })
    return transaction(this.db)
  }

  /**
   * 准备语句
   * @param sql SQL语句
   */
  public prepare(sql: string): Statement {
    return this.db.prepare(sql)
  }

  /**
   * 关闭数据库连接
   */
  public close(): void {
    this.db.close()
  }

  /**
   * 获取原始数据库实例
   */
  public get instance(): SQLiteDatabase {
    return this.db
  }
}

const verboseLogger = process.env.NODE_ENV !== "production"
  ? console.log // 开发环境：输出到控制台
  : (sql: string) => {
      // 生产环境：写入 logs/sql.log
      const logDir = path.join(process.cwd(), "logs")
      const logFile = path.join(logDir, "sql.log")
      // 确保 logs 目录存在
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }
      // 写入日志（追加模式）
      fs.appendFileSync(logFile, `${sql}\n`)
    }

// 导出单例实例
export default SQLiteWrapper.getInstance({
  filename: path.resolve(process.cwd(), "database.db"),
  verbose: verboseLogger
})
