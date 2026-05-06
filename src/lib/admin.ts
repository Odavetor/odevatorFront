const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_TG_IDS ?? '')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n) && n > 0)

// Списки на фронте — только для UI-гейтинга (показ/скрытие админки).
// Реальная авторизация админ-операций — на бэке.
export function isAdminTelegramId(id: number | undefined | null): boolean {
  if (!id) return false
  return ADMIN_IDS.includes(Number(id))
}
