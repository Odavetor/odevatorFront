/* eslint-disable */
import path from 'path'

// require вместо import чтобы Turbopack не бандлил node:sqlite
const { DatabaseSync } = require('node:sqlite') as any

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), '..', 'bot.db')

let _db: any = null

function db(): any {
  if (!_db) {
    try {
      _db = new DatabaseSync(DB_PATH)
      _db.exec('PRAGMA journal_mode = WAL')
      _db.exec('PRAGMA foreign_keys = ON')
      initSchema(_db)
    } catch (e) {
      console.error('[db] failed to open database:', e)
      throw e
    }
  }
  return _db
}

function initSchema(d: any) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER NOT NULL,
      bot_token TEXT NOT NULL,
      username TEXT,
      balance REAL NOT NULL DEFAULT 0,
      active_processes INTEGER NOT NULL DEFAULT 0,
      generations INTEGER NOT NULL DEFAULT 0,
      reg_date TEXT NOT NULL DEFAULT (datetime('now')),
      last_reminder_at TEXT,
      PRIMARY KEY (user_id, bot_token)
    );
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bot_token TEXT NOT NULL,
      image_url TEXT NOT NULL,
      local_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bot_token TEXT NOT NULL,
      amount_rub REAL NOT NULL,
      method TEXT,
      invoice_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS bots (
      bot_token TEXT PRIMARY KEY,
      owner_id INTEGER,
      bot_username TEXT,
      welcome_message TEXT,
      price_1 REAL, price_10 REAL, price_25 REAL, price_50 REAL
    );
  `)
}

function row<T>(val: unknown): T | null {
  return (val as unknown as T) ?? null
}

export interface UserRow {
  user_id: number
  bot_token: string
  username: string | null
  balance: number
  active_processes: number
  generations: number
  reg_date: string
}

export interface HistoryRow {
  id: number
  user_id: number
  bot_token: string
  image_url: string
  local_path: string | null
  created_at: string
}

export function getUser(userId: number, botToken: string): UserRow | null {
  const val = db().prepare('SELECT * FROM users WHERE user_id = ? AND bot_token = ?').get(userId, botToken)
  return row<UserRow>(val)
}

export function ensureUser(userId: number, botToken: string, username: string | null) {
  db().prepare(
    `INSERT OR IGNORE INTO users (user_id, bot_token, username, balance, active_processes, generations, reg_date)
     VALUES (?, ?, ?, 0, 1, 0, datetime('now'))`,
  ).run(userId, botToken, username)
}

export function useGeneration(userId: number, botToken: string): boolean {
  const user = getUser(userId, botToken)
  if (!user || user.active_processes <= 0) return false
  db().prepare(
    `UPDATE users SET active_processes = active_processes - 1, generations = generations + 1
     WHERE user_id = ? AND bot_token = ?`,
  ).run(userId, botToken)
  return true
}

export function refundGeneration(userId: number, botToken: string) {
  db().prepare(
    `UPDATE users SET active_processes = active_processes + 1, generations = generations - 1
     WHERE user_id = ? AND bot_token = ?`,
  ).run(userId, botToken)
}

export function saveHistory(
  userId: number,
  botToken: string,
  imageUrl: string,
  localPath: string | null,
): number {
  const res = db().prepare(
    `INSERT INTO history (user_id, bot_token, image_url, local_path, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
  ).run(userId, botToken, imageUrl, localPath)
  return Number(res.lastInsertRowid)
}

export function getHistory(
  userId: number,
  botToken: string,
  page: number,
  perPage: number,
): HistoryRow[] {
  const rows = db().prepare(
    `SELECT * FROM history
     WHERE user_id = ? AND bot_token = ?
       AND datetime(created_at) > datetime('now', '-3 days')
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
  ).all(userId, botToken, perPage, (page - 1) * perPage)
  return rows as unknown as HistoryRow[]
}

export function countHistory(userId: number, botToken: string): number {
  const val = db().prepare(
    `SELECT COUNT(*) AS cnt FROM history
     WHERE user_id = ? AND bot_token = ?
       AND datetime(created_at) > datetime('now', '-3 days')`,
  ).get(userId, botToken)
  return Number((val as unknown as { cnt: number })?.cnt ?? 0)
}

export function addBalance(userId: number, botToken: string, amount: number) {
  db().prepare(
    `UPDATE users SET balance = balance + ? WHERE user_id = ? AND bot_token = ?`,
  ).run(amount, userId, botToken)
}

export function deductBalance(userId: number, botToken: string, amount: number): boolean {
  const user = getUser(userId, botToken)
  if (!user || user.balance < amount) return false
  db().prepare(
    `UPDATE users SET balance = balance - ? WHERE user_id = ? AND bot_token = ?`,
  ).run(amount, userId, botToken)
  return true
}

export function addProcesses(userId: number, botToken: string, count: number) {
  db().prepare(
    `UPDATE users SET active_processes = active_processes + ? WHERE user_id = ? AND bot_token = ?`,
  ).run(count, userId, botToken)
}

export function createPaymentRecord(
  userId: number,
  botToken: string,
  amountRub: number,
  method: string,
  invoiceId: string,
) {
  db().prepare(
    `INSERT INTO payments (user_id, bot_token, amount_rub, method, invoice_id, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
  ).run(userId, botToken, amountRub, method, invoiceId)
}

interface PaymentRow {
  user_id: number
  bot_token: string
  amount_rub: number
  status: string
}

export function getPaymentByInvoice(invoiceId: string): PaymentRow | null {
  const val = db().prepare('SELECT * FROM payments WHERE invoice_id = ?').get(invoiceId)
  return row<PaymentRow>(val)
}

export function confirmPayment(invoiceId: string) {
  db().prepare("UPDATE payments SET status = 'CONFIRMED' WHERE invoice_id = ?").run(invoiceId)
}
