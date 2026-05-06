#!/bin/bash
# Одноразовый bootstrap-скрипт для свежей Ubuntu (22.04 / 24.04).
# Выполнить НА СЕРВЕРЕ ОДИН РАЗ под пользователем с sudo:
#   wget https://raw.githubusercontent.com/<твой-юзер>/<твой-репо>/main/deploy/bootstrap.sh
#   chmod +x bootstrap.sh
#   ./bootstrap.sh
#
# Что делает:
#   1. Обновляет систему
#   2. Ставит Node.js LTS, pnpm, Caddy
#   3. Открывает порты в ufw (22, 80, 443)
#   4. Создаёт системного юзера velvet и каталог /opt/velvet
#   5. Клонирует репо
#   6. Подсказывает что сделать дальше

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/CHANGE-ME/velvet.git}"
DOMAIN="${DOMAIN:-velvet.example.com}"

echo "==> Update apt"
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential ufw

echo "==> Install Node.js 22.x"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@latest --activate

echo "==> Install Caddy"
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
    sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
    sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update -y
sudo apt-get install -y caddy

echo "==> Open firewall"
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "==> Create system user 'velvet'"
if ! id -u velvet >/dev/null 2>&1; then
    sudo useradd --system --shell /bin/bash --home /opt/velvet --create-home velvet
fi
sudo mkdir -p /opt/velvet
sudo chown -R velvet:velvet /opt/velvet

echo "==> Clone repo as 'velvet' user"
if [ ! -d /opt/velvet/.git ]; then
    sudo -u velvet git clone "$REPO_URL" /opt/velvet
fi

echo "==> Install dependencies"
sudo -u velvet -H bash -c "cd /opt/velvet && pnpm install --frozen-lockfile"

echo
echo "============================================================"
echo "Bootstrap done. Дальше — руками:"
echo
echo "  1. DNS: A-запись $DOMAIN → IP-сервера"
echo
echo "  2. Создать /opt/velvet/.env.production:"
echo "       sudo -u velvet tee /opt/velvet/.env.production <<EOF"
echo "       NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN"
echo "       NEXT_PUBLIC_ADMIN_TG_IDS=твой_tg_id"
echo "       EOF"
echo
echo "  3. Первая сборка:"
echo "       sudo -u velvet -H bash -c 'cd /opt/velvet && pnpm build'"
echo
echo "  4. Установить systemd unit:"
echo "       sudo cp /opt/velvet/deploy/velvet-frontend.service /etc/systemd/system/"
echo "       sudo systemctl daemon-reload"
echo "       sudo systemctl enable --now velvet-frontend"
echo
echo "  5. Настроить Caddy:"
echo "       Скопировать /opt/velvet/deploy/Caddyfile.example в /etc/caddy/Caddyfile,"
echo "       заменить velvet.example.com на $DOMAIN, перезагрузить:"
echo "       sudo systemctl reload caddy"
echo
echo "  6. Проверить https://$DOMAIN — должна открыться мини-апп."
echo
echo "  7. Настроить GitHub Actions — см. DEPLOY.md."
echo "============================================================"
