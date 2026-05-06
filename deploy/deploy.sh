#!/bin/bash
# Скрипт деплоя — запускается GitHub Actions через SSH после пуша в main.
# Лежит в репе, поэтому его обновления тоже подтягиваются git pull'ом.
#
# Поведение:
#   - git pull
#   - pnpm install --frozen-lockfile (если изменился pnpm-lock.yaml)
#   - pnpm build
#   - systemctl restart velvet-frontend
#   - smoke-проверка
#
# Идемпотентен: можно запустить дважды подряд — ничего не сломается.

set -euo pipefail

cd /opt/velvet

echo "==> [1/4] git pull"
git fetch origin main
git reset --hard origin/main

echo "==> [2/4] pnpm install"
pnpm install --frozen-lockfile

echo "==> [3/4] pnpm build"
NODE_ENV=production pnpm build

echo "==> [4/4] restart service"
sudo systemctl restart velvet-frontend

# Ждём пока next start поднимется и отвечает
echo "==> health check"
for i in {1..15}; do
    if curl -sf -o /dev/null http://127.0.0.1:3000; then
        echo "OK — фронт жив на :3000"
        exit 0
    fi
    sleep 2
done

echo "FAIL — :3000 не отвечает за 30с. Логи:"
sudo journalctl -u velvet-frontend -n 50 --no-pager
exit 1
