import mysql from "mysql2/promise"
import { MYSQL_DB_NAME, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_USER } from "../config"

// 定义MySQL数据库配置类型
interface MySQLConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  connectionLimit?: number
  queueLimit?: number
  waitForConnections?: boolean
  connectTimeout?: number
  timezone?: string
  ssl?: string | object
}

// 定义查询结果类型
export interface MySQLQueryResult<T = any> {
  rows: T[]
  fields?: mysql.FieldPacket[]
  affectedRows?: number
  insertId?: number
}

export class MySQLWrapper {
  private pool: mysql.Pool
  private static instance: MySQLWrapper

  private constructor(config: MySQLConfig) {
    try {
      this.pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        connectionLimit: config.connectionLimit || 10,
        queueLimit: config.queueLimit || 0,
        waitForConnections: config.waitForConnections || true,
        connectTimeout: config.connectTimeout || 10000,
        timezone: config.timezone || "Z",
        ssl: config.ssl || undefined,
        // 为确保日期类型正确处理
        dateStrings: true
      })
    } catch (err) {
      console.error("MySQL database initialization error:", err)
      throw err
    }
  }

  // 单例模式
  public static getInstance(config?: MySQLConfig): MySQLWrapper {
    if (!MySQLWrapper.instance) {
      if (!config) {
        throw new Error("MySQL configuration required")
      }
      MySQLWrapper.instance = new MySQLWrapper(config)
    }
    return MySQLWrapper.instance
  }

  /**
   * 执行查询并返回所有匹配的行
   * @param sql SQL查询语句
   * @param params 参数数组或对象
   */
  public async query<T = any>(sql: string, params?: any): Promise<T[]> {
    try {
      const start = Date.now()
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>(sql, params)
      const duration = Date.now() - start
      console.log(`Executed query in ${duration}ms`)
      return rows as T[]
    } catch (err) {
      console.error(`Error executing query: ${sql}`, err)
      throw err
    }
  }

  /**
   * 执行查询并只返回第一行
   * @param sql SQL查询语句
   * @param params 参数数组或对象
   */
  public async queryOne<T = any>(sql: string, params?: any): Promise<T | null> {
    try {
      const start = Date.now()
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>(sql, params)
      const duration = Date.now() - start
      console.log(`Executed queryOne in ${duration}ms`)
      return (rows.length > 0 ? rows[0] : null) as T | null
    } catch (err) {
      console.error(`Error executing queryOne: ${sql}`, err)
      throw err
    }
  }

  /**
   * 执行修改操作（INSERT, UPDATE, DELETE等）
   * @param sql SQL语句
   * @param params 参数数组或对象
   */
  public async execute(sql: string, params?: any): Promise<MySQLQueryResult> {
    try {
      const start = Date.now()
      const [result] = await this.pool.execute(sql, params)
      const duration = Date.now() - start
      console.log(`Executed statement in ${duration}ms`)

      if ("affectedRows" in result) {
        return {
          rows: [],
          affectedRows: (result as mysql.ResultSetHeader).affectedRows,
          insertId: (result as mysql.ResultSetHeader).insertId
        }
      } else {
        return {
          rows: result as any[],
          affectedRows: 0
        }
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
  public async batch(sql: string, paramsArray: any[]): Promise<MySQLQueryResult> {
    return this.transaction(async (connection) => {
      const start = Date.now()
      let totalAffectedRows = 0
      let lastInsertId = 0

      for (const params of paramsArray) {
        const [result] = await connection.execute(sql, params)

        if ("affectedRows" in result) {
          const resultHeader = result as mysql.ResultSetHeader
          totalAffectedRows += resultHeader.affectedRows

          if (resultHeader.insertId > 0) {
            lastInsertId = resultHeader.insertId
          }
        }
      }

      const duration = Date.now() - start
      console.log(`Executed batch in ${duration}ms`)

      return {
        rows: [],
        affectedRows: totalAffectedRows,
        insertId: lastInsertId
      }
    })
  }

  /**
   * 执行事务
   * @param callback 事务回调函数
   */
  public async transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection()
    try {
      await connection.beginTransaction()
      const result = await callback(connection)
      await connection.commit()
      return result
    } catch (err) {
      await connection.rollback()
      console.error("Transaction failed:", err)
      throw err
    } finally {
      connection.release()
    }
  }

  /**
   * 执行存储过程
   * @param procedureName 存储过程名称
   * @param params 参数数组
   */
  public async callProcedure<T = any>(procedureName: string, params: any[] = []): Promise<T[]> {
    try {
      const start = Date.now()
      const placeholders = params.map(() => "?").join(",")
      const sql = `CALL ${procedureName}(${placeholders})`
      const [rows] = await this.pool.query<mysql.RowDataPacket[][]>(sql, params)
      const duration = Date.now() - start
      console.log(`Executed procedure ${procedureName} in ${duration}ms`)

      // MySQL存储过程可能返回多个结果集，通常第一个是我们需要的
      return (Array.isArray(rows[0]) ? rows[0] : rows) as T[]
    } catch (err) {
      console.error(`Error executing procedure ${procedureName}:`, err)
      throw err
    }
  }

  /**
   * 获取连接池状态
   */
  public async getPoolStatus(): Promise<{ threadId: number, config: any }> {
    const connection = await this.pool.getConnection()
    try {
      return {
        threadId: connection.threadId || 0,
        config: connection.config
      }
    } finally {
      connection.release()
    }
  }

  /**
   * 关闭数据库连接池
   */
  public async close(): Promise<void> {
    await this.pool.end()
  }
}

// 导出单例实例
export default MySQLWrapper.getInstance({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB_NAME
})
