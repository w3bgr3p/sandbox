# autoZ3N Sandbox v2.0

Полигон для курса по web-автоматизации. Защищён авторизацией через Privy.

## Быстрый старт

### 1. Получить Privy App ID

1. Зайди на [dashboard.privy.io](https://dashboard.privy.io)
2. Создай приложение → Settings → App ID
3. В разделе **Login methods** включи: `Email`, `MetaMask`, `Twitter`, `Discord`
4. В разделе **Allowed redirect URIs** добавь свой домен CF Pages, например:  
   `https://autoz3n-sandbox.pages.dev`

### 2. Установить и запустить локально

```bash
cp .env.example .env
# Вставь свой App ID в .env

npm install
npm run dev
```

Откроется на `http://localhost:5173`

### 3. Задеплоить на Cloudflare Pages

**Вариант A — через Git (рекомендуется):**

```bash
# 1. Создай репо на GitHub, залей код
git init && git add . && git commit -m "init"
git remote add origin https://github.com/ТЕБЯ/autoz3n-sandbox.git
git push -u origin main

# 2. В Cloudflare Pages:
#    - Connect to Git → выбери репо
#    - Build command: npm run build
#    - Output directory: dist
#    - Environment variable: VITE_PRIVY_APP_ID = твой_app_id
```

**Вариант B — прямой деплой через Wrangler:**

```bash
npm run build
npx wrangler pages deploy dist --project-name autoz3n-sandbox
```

### Структура

```
src/
  main.jsx          ← PrivyProvider + конфиг
  App.jsx           ← auth gate (loading → login → sandbox)
  styles.css
  components/
    LoadingScreen.jsx
    LoginScreen.jsx   ← экран для студентов до логина
    Header.jsx        ← шапка с user info + logout
    Sandbox.jsx       ← все зоны 01–15
```

### Зоны

| # | Тема |
|---|------|
| 01 | Текстовые поля — все типы input |
| 02 | Select, Checkbox, Radio, Toggle |
| 03 | Кнопки, Counter, Dialog |
| 04–05 | Shadow DOM (open + closed) |
| 06 | Canvas — попади в кнопку |
| 07 | iframe |
| 08 | Динамический DOM |
| 09 | Хитрые элементы (drag&drop, hidden, pagination) |
| 10 | Прочие HTML-элементы (table, alerts, etc) |
| 11 | Event log |
| 12 | Web3 — Injected Wallet (MetaMask) |
| 13 | Canvas Fingerprinting |
| 14 | Bot Detection |
| 15 | Anti-DevTools |

### Переменные окружения

| Переменная | Описание |
|---|---|
| `VITE_PRIVY_APP_ID` | App ID из dashboard.privy.io |
