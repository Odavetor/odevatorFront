# Деплой Velvet Mini App

Пошагово. Деплоим на одну Ubuntu-машину фронт + бэк + Caddy + Postgres.

## Что нам нужно

- Ubuntu 22.04 / 24.04 сервер с публичным IP
- Домен (например `velvet.example.com`), привязанный к серверу A-записью
- Доступ по SSH с правами `sudo`
- GitHub-репозиторий с этим кодом (`origin/main`)

---

## 1. DNS

В панели регистратора домена/DNS:
```
A    velvet.example.com    <IP-сервера>
```

Дождись пропагации (`dig velvet.example.com` должен показать твой IP).

---

## 2. Bootstrap сервера (один раз)

SSH'емся на сервер, скачиваем и запускаем `deploy/bootstrap.sh`:

```bash
ssh root@your-server-ip   # или sudo-юзер

# Поправь URL репо и домен
export REPO_URL="https://github.com/<your-username>/velvet.git"
export DOMAIN="velvet.example.com"

wget https://raw.githubusercontent.com/<your-username>/velvet/main/deploy/bootstrap.sh
chmod +x bootstrap.sh
./bootstrap.sh
```

Скрипт сделает:
- Установит Node.js 22 LTS, pnpm, Caddy
- Откроет порты 22/80/443 в `ufw`
- Создаст системного юзера `velvet` и папку `/opt/velvet`
- Склонирует репо

После его завершения — следующие шаги вручную (он подскажет).

---

## 3. Создать `.env.production`

```bash
sudo -u velvet tee /opt/velvet/.env.production <<EOF
NEXT_PUBLIC_API_BASE_URL=https://velvet.example.com
NEXT_PUBLIC_ADMIN_TG_IDS=123456789
EOF
```

`NEXT_PUBLIC_*` запекаются в бандл во время `pnpm build`, поэтому файл должен быть на месте **до** первой сборки.

---

## 4. Первая сборка

```bash
sudo -u velvet -H bash -c 'cd /opt/velvet && pnpm build'
```

---

## 5. Установить systemd-сервис

```bash
sudo cp /opt/velvet/deploy/velvet-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now velvet-frontend
sudo systemctl status velvet-frontend
```

Логи в реалтайме:
```bash
sudo journalctl -u velvet-frontend -f
```

---

## 6. Разрешить деплой-скрипту перезапускать сервис

```bash
sudo cp /opt/velvet/deploy/sudoers-velvet /etc/sudoers.d/velvet
sudo chmod 440 /etc/sudoers.d/velvet
sudo visudo -c   # проверка синтаксиса
```

Это даст юзеру `velvet` право выполнять только две команды без пароля: рестарт сервиса и просмотр его логов. Никаких других `sudo`-прав.

---

## 7. Caddy (HTTPS reverse proxy)

```bash
sudo cp /opt/velvet/deploy/Caddyfile.example /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile   # заменить velvet.example.com на свой домен
sudo systemctl reload caddy
sudo systemctl status caddy
```

Caddy сам выпустит TLS-сертификат при первом запросе на домен — никакого `certbot`. Через 30–60 секунд `https://velvet.example.com` уже работает.

---

## 8. Backend (Go)

Я писал ТЗ для бэка отдельно (`C:\dev\odevatorBack\TZ_ADMIN_CATALOG.txt`). Деплой Go-бинаря тоже на этот же сервер:

```bash
cd /opt/odevator-back
go build -o /usr/local/bin/odevator-back ./...

sudo tee /etc/systemd/system/odevator-back.service <<EOF
[Unit]
Description=Odevator backend
After=network.target postgresql.service

[Service]
Type=simple
EnvironmentFile=/opt/odevator-back/.env
ExecStart=/usr/local/bin/odevator-back
Restart=always
RestartSec=4

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now odevator-back
```

Postgres ставится отдельно (`sudo apt install postgresql`), миграции из `migrations/*.sql` накатить вручную.

---

## 9. GitHub Actions: автодеплой фронта

### 9.1. Сгенерировать SSH-ключ для деплоя

На своём компе (НЕ на сервере):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/velvet_deploy -N ""
```

Получишь два файла:
- `~/.ssh/velvet_deploy` — приватный (в GitHub Secrets)
- `~/.ssh/velvet_deploy.pub` — публичный (на сервере)

### 9.2. Положить публичный ключ на сервер юзеру `velvet`

```bash
# скопировать содержимое .pub
cat ~/.ssh/velvet_deploy.pub

# на сервере под root
sudo -u velvet mkdir -p /opt/velvet/.ssh
sudo -u velvet tee -a /opt/velvet/.ssh/authorized_keys <<EOF
ssh-ed25519 AAAA... github-actions-deploy
EOF
sudo -u velvet chmod 600 /opt/velvet/.ssh/authorized_keys
sudo -u velvet chmod 700 /opt/velvet/.ssh
```

Проверим что заходит:
```bash
ssh -i ~/.ssh/velvet_deploy velvet@<server-ip> "echo ok"
# должно вывести "ok"
```

### 9.3. Завести GitHub Secrets

В репо: **Settings → Secrets and variables → Actions → New repository secret**.

Создать четыре секрета:

| Имя | Значение |
|---|---|
| `SSH_HOST` | `<IP-сервера>` или `velvet.example.com` |
| `SSH_PORT` | `22` (или нестандартный, если менял) |
| `SSH_USER` | `velvet` |
| `SSH_PRIVATE_KEY` | содержимое файла `~/.ssh/velvet_deploy` (с `-----BEGIN...END-----`) |

### 9.4. Готово

Workflow `.github/workflows/deploy.yml` уже в репе. На любой пуш в `main`:

1. GitHub Actions поднимется
2. Подключится к серверу по SSH под юзером `velvet`
3. Запустит `/opt/velvet/deploy/deploy.sh`
4. Скрипт сделает: `git pull` → `pnpm install` → `pnpm build` → `systemctl restart velvet-frontend` → health-check
5. Если health-check провалился — Actions упадёт красным с логами `journalctl`

Запустить деплой руками без пуша: вкладка **Actions** на GitHub → workflow «Deploy frontend» → **Run workflow**.

---

## 10. Проверка

```bash
# фронт
curl -I https://velvet.example.com
# 200 OK

# бэк через Caddy
curl https://velvet.example.com/health
# OK

# логи фронта
sudo journalctl -u velvet-frontend -f
```

Telegram BotFather: твоему боту → **Bot Settings → Configure Mini App → Edit URL** → `https://velvet.example.com`.

---

## Что делать когда что-то сломалось

```bash
# фронт не отвечает
sudo systemctl status velvet-frontend
sudo journalctl -u velvet-frontend -n 100 --no-pager

# Caddy не отдаёт HTTPS
sudo systemctl status caddy
sudo journalctl -u caddy -n 50 --no-pager

# нет ответа на https://домен
sudo ss -tlnp | grep -E ':80|:443|:3000|:8080'   # должны быть caddy + node + go-binary

# rollback фронта
cd /opt/velvet
sudo -u velvet git log --oneline -10
sudo -u velvet git reset --hard <commit-hash>
sudo -u velvet pnpm build
sudo systemctl restart velvet-frontend
```

---

## Архитектура — кратко

```
Internet
   ↓ :443 (HTTPS)
Caddy
   ├─→ /api/v1/*  → :8080  (Go backend, systemd: odevator-back)
   ├─→ /health    → :8080
   └─→ остальное  → :3000  (Next.js, systemd: velvet-frontend)

GitHub push main → Actions → SSH → /opt/velvet/deploy/deploy.sh
                                       ↓
                                    git pull
                                    pnpm install
                                    pnpm build
                                    systemctl restart velvet-frontend
```
