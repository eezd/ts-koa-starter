import type { PoolClient, QueryConfig } from "pg"
import { Pool } from "pg"
import { PG_DB_NAME, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from "../config"

// 定义PostgreSQL数据库配置类型
interface PostgresConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
  ssl?: boolean | object
}

export class PostgresWrapper {
  private pool: Pool
  private static instance: PostgresWrapper

  private constructor(config: PostgresConfig) {
    this.pool = new Pool({
      ...config,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 10000
    })

    this.pool.on("error", (err: Error) => {
      console.error("Unexpected database error:", err.message)
    })
  }

  // 单例模式
  public static getInstance(config?: PostgresConfig): PostgresWrapper {
    if (!PostgresWrapper.instance) {
      if (!config) throw new Error("PostgreSQL configuration required")
      PostgresWrapper.instance = new PostgresWrapper(config)
    }
    return PostgresWrapper.instance
  }

  /**
   * 执行查询并返回所有结果
   * @param query 查询配置或SQL字符串
   * @param values 参数值数组
   */
  public async query<T = any>(
    query: string | QueryConfig,
    values?: any[]
  ): Promise<T[]> {
    const client = await this.pool.connect()
    try {
      const start = Date.now()
      const result = await client.query<T>(query, values)
      const duration = Date.now() - start
      console.log(`Executed query in ${duration}ms`)
      return result.rows
    } catch (err) {
      console.error(`Error executing query: ${typeof query === "string" ? query : query.text}`, err)
      throw err
    } finally {
      client.release()
    }
  }

  /**
   * 执行查询并只返回第一行
   * @param query 查询配置或SQL字符串
   * @param values 参数值数组
   */
  public async queryOne<T = any>(
    query: string | QueryConfig,
    values?: any[]
  ): Promise<T | null> {
    const client = await this.pool.connect()
    try {
      const start = Date.now()
      const result = await client.query<T>(query, values)
      const duration = Date.now() - start
      console.log(`Executed queryOne in ${duration}ms`)
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (err) {
      console.error(`Error executing queryOne: ${typeof query === "string" ? query : query.text}`, err)
      throw err
    } finally {
      client.release()
    }
  }

  /**
   * 执行修改操作（INSERT, UPDATE, DELETE等）
   * @param query 查询配置或SQL字符串
   * @param values 参数值数组
   */
  public async execute<T = any>(
    query: string | QueryConfig,
    values?: any[]
  ): Promise<{ rowCount: number, rows: T[] }> {
    const client = await this.pool.connect()
    try {
      const start = Date.now()
      const result = await client.query<T>(query, values)
      const duration = Date.now() - start
      console.log(`Executed statement in ${duration}ms`)
      return {
        rowCount: result.rowCount || 0,
        rows: result.rows
      }
    } catch (err) {
      console.error(`Error executing statement: ${typeof query === "string" ? query : query.text}`, err)
      throw err
    } finally {
      client.release()
    }
  }

  /**
   * 执行批量操作
   * @param query 查询配置或SQL字符串
   * @param valuesArray 参数数组的数组
   */
  public async batch<T = any>(
    query: string | QueryConfig,
    valuesArray: any[][]
  ): Promise<{ rowCount: number, rows: T[] }> {
    return this.transaction(async (client) => {
      const start = Date.now()
      let totalRows: T[] = []
      let totalRowCount = 0

      for (const values of valuesArray) {
        const result = await client.query<T>(query, values)
        totalRows = [...totalRows, ...result.rows]
        totalRowCount += result.rowCount || 0
      }

      const duration = Date.now() - start
      console.log(`Executed batch in ${duration}ms`)

      return {
        rowCount: totalRowCount,
        rows: totalRows
      }
    })
  }

  /**
   * 执行事务
   * @param callback 事务回调函数
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (err) {
      await client.query("ROLLBACK")
      console.error("Transaction failed:", err)
      throw err
    } finally {
      client.release()
    }
  }

  /**
   * 获取连接池状态
   */
  public getPoolStatus(): {
    totalCount: number
    idleCount: number
    waitingCount: number
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
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
export default PostgresWrapper.getInstance({
  host: PG_HOST,
  port: Number(PG_PORT),
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DB_NAME
})
