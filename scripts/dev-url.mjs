// Печатает доступные LAN-адреса для dev-сервера.
// Запускается через `predev` в package.json. Помогает открыть мини-апп с телефона
// в той же Wi-Fi сети без поиска IP в ipconfig / ifconfig.
import os from 'node:os'

const port = process.env.PORT || 3000
const ifaces = os.networkInterfaces()

const lanIps = []
for (const name of Object.keys(ifaces)) {
  for (const ni of ifaces[name] ?? []) {
    if (ni.family !== 'IPv4' || ni.internal) continue
    // Игнорируем link-local (APIPA) и необычные виртуальные адаптеры
    if (ni.address.startsWith('169.254.')) continue
    lanIps.push({ name, address: ni.address })
  }
}

const dim = (s) => `\x1b[2m${s}\x1b[0m`
const bold = (s) => `\x1b[1m${s}\x1b[0m`
const rose = (s) => `\x1b[38;5;204m${s}\x1b[0m`

console.log()
console.log(rose('▲ Velvet dev server'))
console.log(`  ${dim('Local:    ')}${bold(`http://localhost:${port}`)}`)
if (lanIps.length === 0) {
  console.log(`  ${dim('Network:  ')}${dim('— нет внешних интерфейсов')}`)
} else {
  for (const { name, address } of lanIps) {
    console.log(`  ${dim('Network:  ')}${bold(`http://${address}:${port}`)}  ${dim('· ' + name)}`)
  }
  console.log()
  console.log(dim('  Открой Network-адрес с телефона в той же Wi-Fi.'))
  console.log(dim('  Если не открывается — проверь Windows Firewall (см. README/комментарий ниже).'))
}
console.log()
