# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

.typing-indicator {
  display: flex;
  justify-content: flex-start; /* или center, если нужно по центру блока */
  align-items: center; /* Центрирует точки по вертикали */
  gap: 0.5rem;
  min-height: 1.5em;
}

# Dify Chat UI

Современный интерфейс чата с поддержкой нескольких ботов, темной/светлой темы, истории чатов, прикрепления файлов и удобным UX — максимально похож на ChatGPT.

## Возможности

- Поддержка нескольких ботов (API-ключи добавляются через интерфейс)
- История чатов с сохранением в localStorage
- Темная и светлая тема (переключение в один клик)
- Прикрепление файлов к сообщениям
- Современный дизайн и адаптивная верстка
- Удаление чатов и ботов через интерфейс
- Схлопывающийся список ботов
- Поддержка markdown в сообщениях
- Аватары для пользователя и бота
- Интуитивный UX (отправка по Enter, Shift+Enter — новая строка)
- Анимация ожидания ответа

## Быстрый старт

1. Клонируй репозиторий:
   ```sh
   git clone https://github.com/an-bocharov/dify-chat-ui.git
   cd dify-chat-ui
   ```

2. Установи зависимости:
   ```sh
   npm install
   ```

3. Запусти проект:
   ```sh
   npm run dev
   ```

4. Открой [http://localhost:5173](http://localhost:5173) в браузере.

## Настройка API

- Для работы нужен API-ключ Dify (или другого совместимого сервиса).
- Добавь ключ через интерфейс (кнопка «Добавить бота» в боковой панели).
- Можно добавить несколько ботов и быстро переключаться между ними.

## Скриншоты

![Скриншот интерфейса](./screenshot.png)

## Технологии

- React + TypeScript
- CSS (без UI-фреймворков)
- React Markdown
- Axios

## TODO / Идеи для развития

- Drag&Drop для файлов
- Поддержка групповых чатов
- Настройки профиля пользователя
- Сохранение истории на сервере

---

**Автор:** [an-bocharov](https://github.com/an-bocharov)  
**Лицензия:** MIT