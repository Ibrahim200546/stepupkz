# 🛍️ StepUp Shoes - Интернет-аяқ киім дүкені

**[Русский](./README.md) | [English](./README_EN.md)**

<div align="center">

![StepUp Shoes](https://img.shields.io/badge/StepUp-Shoes-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

Интеграцияланған мессенджер және әкімші панелі бар заманауи аяқ киім дүкені

[🌐 Демо](https://stepupkz.vercel.app/) • [📚 Құжаттама](./docs/)

<img width="418" height="421" alt="image" src="https://github.com/user-attachments/assets/58840e0c-632f-4c85-ac51-1e75ccc6acef" />      <img width="413" height="416" alt="image" src="https://github.com/user-attachments/assets/b444f855-b168-475f-a05a-7a23922a8de3" />
</div>

---

## 📋 Мазмұны

- [Жоба туралы](#-жоба-туралы)
- [Мүмкіндіктер](#-мүмкіндіктер)
- [Технологиялық стек](#-технологиялық-стек)
- [Орнату](#-орнату)
- [Конфигурация](#-конфигурация)
- [Пайдалану](#-пайдалану)
- [Жоба құрылымы](#-жоба-құрылымы)
- [Құжаттама](#-құжаттама)
- [Скрипттер](#-скрипттер)
- [Лицензия](#-лицензия)

---

## 🎯 Жоба туралы

**StepUp Shoes** — Жетісу мемлекеттік университеті үшін әзірленген толық мүмкіндіктері бар аяқ киім интернет-дүкені. Жоба мыналарды қамтиды:

- 🛒 Сүзу және іздеу мүмкіндігі бар тауарлар каталогы
- 💬 Кірістірілген пиксель-арт мессенджері **FlickMassege**
- 👤 Тапсырыстар тарихы бар жеке кабинет
- 🔐 Тауарларды басқаруға арналған әкімші панелі
- 🌍 3 тілді қолдау (RU, EN, KK)
- 📱 Барлық құрылғыларға адаптивті дизайн

---

## ✨ Мүмкіндіктер

### 🛍️ Сатып алушыларға

- **Тауарлар каталогы**: бағасы, брендi, өлшемі бойынша сүзу
- **Іздеу**: атауы немесе артикулы бойынша жылдам іздеу
- **Себет**: тауарларды қосу және тапсырыс ресімдеу
- **Жеке кабинет**: профиль, тапсырыстар тарихы
- **Көптілділік**: RU/EN/KK арасында ауысу

### 💬 FlickMassege (Мессенджер)

- **Мәтіндік хабарлар**: жедел жөнелту
- **Дауыстық хабарлар**: визуализациямен жазу және ойнату
- **Стикерлер**: дайын стикерлерді жөнелту
- **Эмодзи**: кірістірілген эмодзи-пикер
- **Realtime**: Supabase арқылы нақты уақыттағы жаңартулар
- **Хабарландырулар**: жаңа хабарлар үшін браузер хабарландырулары
- **Статустар**: онлайн/офлайн, оқылған/оқылмаған

### 🔐 Әкімшілерге

- **Тауарларды басқару**: қосу, өңдеу, жою
- **Брендтерді басқару**: брендтерді құру және өңдеу
- **Тапсырыстарды басқару**: қарау және статустарды жаңарту
- **Есептер**: сатылымдар және тапсырыстар статистикасы
- **Рөлдер**: Әкімші, Менеджер

---

## 🚀 Технологиялық стек

### Frontend

- **React 18.3** - UI кітапханасы
- **TypeScript 5.8** - типтендіру
- **Vite 5.4** - жинақтаушы
- **TailwindCSS 3.4** - стильдеу
- **Shadcn/ui** - компоненттер
- **React Router 6** - маршруттау
- **React Query** - күйді басқару
- **i18next** - интернационализация

### Backend

- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL - деректер қоры
  - Realtime - чат үшін WebSocket
  - Storage - суреттерді сақтау
  - Auth - аутентификация
  - RLS - Row Level Security

### Мессенджер (FlickMassege)

- **WaveSurfer.js** - аудио визуализациясы
- **emoji-picker-react** - эмодзи пикер
- **Web Audio API** - хабарландыру дыбыстары
- **MediaRecorder API** - дауысты жазу
- **Notification API** - браузер хабарландырулары

### Әзірлеу құралдары

- **ESLint** - линтер
- **Prettier** - форматтау
- **TypeScript ESLint** - TS ережелері
- **Vite PWA** - PWA қолдауы

---

## 📦 Орнату

### Талаптар

- Node.js >= 18.0.0
- npm >= 9.0.0 немесе pnpm/yarn
- Supabase аккаунты (тегін)

### Орнату қадамдары

1. **Репозиторийді клондау**

```bash
git clone https://github.com/yourusername/stepupkz.git
cd stepupkz
```

2. **Тәуелділіктерді орнату**

```bash
npm install
# немесе
pnpm install
# немесе
yarn install
```

3. **Орта айнымалыларын баптау**

Жоба түбірінде `.env` файлын жасаңыз:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase баптау**

- [Supabase](https://supabase.com) сайтында жоба жасаңыз
- `supabase/migrations/` папкасынан миграцияларды орындаңыз
- Storage bucket `products` ішіне суреттерді жүктеңіз

5. **Жобаны іске қосу**

```bash
npm run dev
```

[http://localhost:8080](http://localhost:8080) ашыңыз

---

## ⚙️ Конфигурация

### Supabase миграциялары

Supabase SQL Editor-де SQL миграцияларын орындаңыз:

1. `20251129000000_flick_messenger_schema.sql` - мессенджер схемасы
2. `20251129000001_flick_test_data.sql` - тест деректері (опция)
3. `20251129000002_enable_realtime.sql` - Realtime қосу
4. `20251129000003_fix_rls_registration.sql` - RLS түзету
5. `20251129000004_fix_rls_recursion.sql` - рекурсияны түзету

### Тест пайдаланушылары (FlickMassege)

Миграцияларды орындағаннан кейін 3 тест пайдаланушы жасалады:

- **Alice**: alice@example.com / password123
- **Bob**: bob@example.com / password123
- **Charlie**: charlie@example.com / password123

---

## 🎮 Пайдалану

### Әзірлеу үшін

```bash
# Dev серверді іске қосу
npm run dev

# Production үшін жинау
npm run build

# Production жинағын қарау
npm run preview

# Линтинг
npm run lint
```

### Әкімші пайдаланушысын жасау

1. Сайтта тіркеліңіз
2. Supabase SQL Editor-де орындаңыз:

```sql
-- Әкімші рөлін қосу
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-from-auth-users', 'admin');
```

3. Сайтқа қайта кіріңіз

---

## 📁 Жоба құрылымы

```
stepupkz/
├── docs/                      # Құжаттама
│   ├── FLICK_INTEGRATION_GUIDE.md
│   ├── FLICK_SETUP_README.md
│   ├── FIX_409_CONFLICT.md
│   ├── FIX_NOTIFICATIONS.md
│   ├── FIX_RECURSION.md
│   └── CHAT_UPDATE.md
├── public/                    # Статикалық файлдар
│   ├── placeholder-shoe.svg
│   └── ...
├── src/
│   ├── components/           # React компоненттері
│   │   ├── admin/           # Әкімші панелі
│   │   ├── cart/            # Себет
│   │   ├── chat/            # FlickMassege мессенджері
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── StickerPicker.tsx
│   │   │   └── CustomEmojiPicker.tsx
│   │   ├── layout/          # Navbar, Footer
│   │   └── products/        # Тауар карточкалары
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.tsx
│   │   ├── useCart.tsx
│   │   ├── useFlickChat.tsx
│   │   └── useFlickMessages.tsx
│   ├── integrations/        # Интеграциялар (Supabase)
│   │   └── supabase/
│   ├── locales/             # Аудармалар (i18n)
│   │   ├── en.json
│   │   ├── ru.json
│   │   └── kk.json
│   ├── pages/               # Қолданба беттері
│   │   ├── Home.tsx
│   │   ├── Catalog.tsx
│   │   ├── Product.tsx
│   │   ├── Cart.tsx
│   │   ├── Account.tsx
│   │   ├── Admin.tsx
│   │   ├── FlickChat.tsx
│   │   ├── FlickLogin.tsx
│   │   └── FlickRegister.tsx
│   ├── types/               # TypeScript типтері
│   ├── lib/                 # Утилиттер
│   │   └── notificationSound.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/          # SQL миграциялары
├── .env.example             # .env үлгісі
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📚 Құжаттама

Қосымша құжаттама [`docs/`](./docs/) папкасында:

- **[FLICK_INTEGRATION_GUIDE.md](./docs/FLICK_INTEGRATION_GUIDE.md)** - FlickMassege техникалық интеграциясы
- **[FLICK_SETUP_README.md](./docs/FLICK_SETUP_README.md)** - FlickMassege жылдам бастау
- **[FIX_409_CONFLICT.md](./docs/FIX_409_CONFLICT.md)** - 409 қақтығыстарын түзету
- **[FIX_NOTIFICATIONS.md](./docs/FIX_NOTIFICATIONS.md)** - хабарландыруларды түзету
- **[FIX_RECURSION.md](./docs/FIX_RECURSION.md)** - RLS рекурсиясын түзету
- **[CHAT_UPDATE.md](./docs/CHAT_UPDATE.md)** - чат жаңартулары

---

## 📜 Скрипттер

| Команда | Сипаттама |
|---------|-----------|
| `npm run dev` | Dev серверді іске қосу (http://localhost:8080) |
| `npm run build` | Production үшін `dist/` папкасына жинау |
| `npm run preview` | Production жинағын қарау |
| `npm run lint` | ESLint арқылы кодты тексеру |

---

## 🌟 Жобаның ерекшеліктері

### Сүзу және сұрыптау

Каталог қолдайды:
- **Бағасы бойынша сүзу** (0-ден 100,000 ₸-ға дейін слайдер)
- **Бренд бойынша сүзу** (Nike, Adidas, Puma, Reebok)
- **Өлшемі бойынша сүзу** (38-45)
- **Сұрыптау**: Танымал, Бағасы (арзан/қымбат), Жаңалықтар
- **Пагинация**: беттегі 10 тауар

### Пиксель-арт дизайн (FlickMassege)

- **Press Start 2P** қарпі (Google Fonts)
- Градиентті аватарлар
- Пиксель көлеңкелері (`shadow-pixel`)
- Әйнек эффектісі (`glass-panel`)
- Ретро стиліндегі анимациялар

### Realtime жаңартулар

- Хабарларды жедел жеткізу
- "Оқылған" статустарын жаңарту
- Онлайн/офлайн индикаторлары
- Қойындылар арасында синхрондау

---

## 🐛 Белгілі мәселелер және шешімдер

### message_status-та 409 Conflict

**Мәселе**: Хабарларды жөнелту кезінде жазбалардың қайталануы.

**Шешім**: `onConflict: 'message_id,user_id'` параметрімен `.insert()` орнына `.upsert()` қолданылады.

Толығырақ: [docs/FIX_409_CONFLICT.md](./docs/FIX_409_CONFLICT.md)

### RLS-тегі шексіз рекурсия

**Мәселе**: Row Level Security саясаттарындағы шексіз рекурсия.

**Шешім**: Демо нұсқасы үшін RLS саясаттары жеңілдетілді.

Толығырақ: [docs/FIX_RECURSION.md](./docs/FIX_RECURSION.md)

### Шексіз хабарландырулар

**Мәселе**: Бір хабарға көптеген хабарландырулар.

**Шешім**: `Set` арқылы көрсетілген хабарландыруларды бақылау қосылды.

Толығырақ: [docs/FIX_NOTIFICATIONS.md](./docs/FIX_NOTIFICATIONS.md)

---

## 🤝 Жобаға үлес қосу

Біз сіздің үлесіңізді қарсы аламыз! Үлес қосу үшін:

1. Репозиторийді форктаңыз
2. Өз мүмкіндігіңіз үшін тармақ жасаңыз (`git checkout -b feature/AmazingFeature`)
3. Өзгерістерді коммиттеңіз (`git commit -m 'Add some AmazingFeature'`)
4. Тармаққа push жасаңыз (`git push origin feature/AmazingFeature`)
5. Pull Request ашыңыз

---

## 📞 Байланыс

**Жетісу мемлекеттік университеті**

- 📍 И. 187а, Ілияс Жансүгіров көшесі, Талдықорған
- 📧 Email: tanirbergenibrahim44@gmail.com
- 📱 Телефон: +7 (776) 267-59-57

---

## 📄 Лицензия

Бұл жоба Жетісу мемлекеттік университетінің оқу жобасының шеңберінде білім беру мақсаттары үшін жасалған.

---

## 🙏 Алғыс

- [Supabase](https://supabase.com) - Backend as a Service
- [Shadcn/ui](https://ui.shadcn.com) - UI компоненттері
- [TailwindCSS](https://tailwindcss.com) - CSS фреймворк
- [WaveSurfer.js](https://wavesurfer-js.org) - аудио визуализациясы
- [emoji-picker-react](https://github.com/ealush/emoji-picker-react) - эмодзи пикер

---

<div align="center">

**Жетісу мемлекеттік университетінде ❤️ жасалды**

[⬆ Жоғары](#-stepup-shoes---интернет-аяқ-киім-дүкені)

</div>
