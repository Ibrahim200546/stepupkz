# 🛍️ StepUp Shoes - Online Shoe Store

**[Русский](./README.md) | [Қазақша](./README_KK.md)**

<div align="center">

![StepUp Shoes](https://img.shields.io/badge/StepUp-Shoes-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

Modern online shoe store with integrated messenger and admin panel

[🌐 Demo](https://stepupkz.vercel.app/) • [📚 Documentation](./docs/)

<img width="418" height="421" alt="image" src="https://github.com/user-attachments/assets/58840e0c-632f-4c85-ac51-1e75ccc6acef" />  <img width="413" height="416" alt="image" src="https://github.com/user-attachments/assets/b444f855-b168-475f-a05a-7a23922a8de3" />
</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Scripts](#-scripts)
- [License](#-license)

---

## 🎯 About

**StepUp Shoes** is a full-featured online shoe store developed for Zhetysu State University. The project includes:

- 🛒 Product catalog with filtering and search
- 💬 Built-in pixel-art messenger **FlickMassege**
- 👤 Personal account with order history
- 🔐 Admin panel for product management
- 🌍 Support for 3 languages (RU, EN, KK)
- 📱 Responsive design for all devices

---

## ✨ Features

### 🛍️ For Customers

- **Product Catalog**: filtering by price, brand, size
- **Search**: quick search by name or SKU
- **Cart**: add products and place orders
- **Personal Account**: profile, order history
- **Multilingual**: switch between RU/EN/KK

### 💬 FlickMassege (Messenger)

- **Text Messages**: instant delivery
- **Voice Messages**: record and playback with visualization
- **Stickers**: send ready-made stickers
- **Emoji**: built-in emoji picker
- **Realtime**: updates in real-time via Supabase
- **Notifications**: browser notifications for new messages
- **Statuses**: online/offline, read/unread

### 🔐 For Administrators

- **Product Management**: add, edit, delete
- **Brand Management**: create and edit brands
- **Order Management**: view and update statuses
- **Reports**: sales and order statistics
- **Roles**: Administrator, Manager

---

## 🚀 Tech Stack

### Frontend

- **React 18.3** - UI library
- **TypeScript 5.8** - type safety
- **Vite 5.4** - build tool
- **TailwindCSS 3.4** - styling
- **Shadcn/ui** - components
- **React Router 6** - routing
- **React Query** - state management
- **i18next** - internationalization

### Backend

- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL - database
  - Realtime - WebSocket for chat
  - Storage - image storage
  - Auth - authentication
  - RLS - Row Level Security

### Messenger (FlickMassege)

- **WaveSurfer.js** - audio visualization
- **emoji-picker-react** - emoji picker
- **Web Audio API** - notification sounds
- **MediaRecorder API** - voice recording
- **Notification API** - browser notifications

### Development Tools

- **ESLint** - linter
- **Prettier** - code formatter
- **TypeScript ESLint** - TS rules
- **Vite PWA** - PWA support

---

## 📦 Installation

### Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm/yarn
- Supabase account (free)

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/stepupkz.git
cd stepupkz
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Configure environment variables**

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**

- Create a project at [Supabase](https://supabase.com)
- Run migrations from `supabase/migrations/` folder
- Upload images to Storage bucket `products`

5. **Run the project**

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

---

## ⚙️ Configuration

### Supabase Migrations

Execute SQL migrations in Supabase SQL Editor:

1. `20251129000000_flick_messenger_schema.sql` - messenger schema
2. `20251129000001_flick_test_data.sql` - test data (optional)
3. `20251129000002_enable_realtime.sql` - enable Realtime
4. `20251129000003_fix_rls_registration.sql` - fix RLS
5. `20251129000004_fix_rls_recursion.sql` - fix recursion

### Test Users (FlickMassege)

After running migrations, 3 test users will be created:

- **Alice**: alice@example.com / password123
- **Bob**: bob@example.com / password123
- **Charlie**: charlie@example.com / password123

---

## 🎮 Usage

### For Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Creating Admin User

1. Register on the website
2. In Supabase SQL Editor run:

```sql
-- Add administrator role
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-from-auth-users', 'admin');
```

3. Log in again

---

## 📁 Project Structure

```
stepupkz/
├── docs/                      # Documentation
│   ├── FLICK_INTEGRATION_GUIDE.md
│   ├── FLICK_SETUP_README.md
│   ├── FIX_409_CONFLICT.md
│   ├── FIX_NOTIFICATIONS.md
│   ├── FIX_RECURSION.md
│   └── CHAT_UPDATE.md
├── public/                    # Static files
│   ├── placeholder-shoe.svg
│   └── ...
├── src/
│   ├── components/           # React components
│   │   ├── admin/           # Admin panel
│   │   ├── cart/            # Cart
│   │   ├── chat/            # FlickMassege messenger
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── StickerPicker.tsx
│   │   │   └── CustomEmojiPicker.tsx
│   │   ├── layout/          # Navbar, Footer
│   │   └── products/        # Product cards
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.tsx
│   │   ├── useCart.tsx
│   │   ├── useFlickChat.tsx
│   │   └── useFlickMessages.tsx
│   ├── integrations/        # Integrations (Supabase)
│   │   └── supabase/
│   ├── locales/             # Translations (i18n)
│   │   ├── en.json
│   │   ├── ru.json
│   │   └── kk.json
│   ├── pages/               # Application pages
│   │   ├── Home.tsx
│   │   ├── Catalog.tsx
│   │   ├── Product.tsx
│   │   ├── Cart.tsx
│   │   ├── Account.tsx
│   │   ├── Admin.tsx
│   │   ├── FlickChat.tsx
│   │   ├── FlickLogin.tsx
│   │   └── FlickRegister.tsx
│   ├── types/               # TypeScript types
│   ├── lib/                 # Utilities
│   │   └── notificationSound.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/          # SQL migrations
├── .env.example             # Example .env
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📚 Documentation

Additional documentation is in the [`docs/`](./docs/) folder:

- **[FLICK_INTEGRATION_GUIDE.md](./docs/FLICK_INTEGRATION_GUIDE.md)** - FlickMassege technical integration
- **[FLICK_SETUP_README.md](./docs/FLICK_SETUP_README.md)** - FlickMassege quick start
- **[FIX_409_CONFLICT.md](./docs/FIX_409_CONFLICT.md)** - fixing 409 conflicts
- **[FIX_NOTIFICATIONS.md](./docs/FIX_NOTIFICATIONS.md)** - fixing notifications
- **[FIX_RECURSION.md](./docs/FIX_RECURSION.md)** - fixing RLS recursion
- **[CHAT_UPDATE.md](./docs/CHAT_UPDATE.md)** - chat updates

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:8080) |
| `npm run build` | Build for production to `dist/` folder |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code with ESLint |

---

## 🌟 Project Features

### Filtering and Sorting

Catalog supports:
- **Price Filter** (slider from 0 to 100,000 ₸)
- **Brand Filter** (Nike, Adidas, Puma, Reebok)
- **Size Filter** (38-45)
- **Sorting**: Popular, Price (low/high), Newest
- **Pagination**: 10 products per page

### Pixel-Art Design (FlickMassege)

- **Press Start 2P** font (Google Fonts)
- Gradient avatars
- Pixel shadows (`shadow-pixel`)
- Glass effect (`glass-panel`)
- Retro-style animations

### Realtime Updates

- Instant message delivery
- Read status updates
- Online/offline indicators
- Cross-tab synchronization

---

## 🐛 Known Issues and Solutions

### 409 Conflict in message_status

**Problem**: Duplicate records when sending messages.

**Solution**: Using `.upsert()` instead of `.insert()` with `onConflict: 'message_id,user_id'`.

Details: [docs/FIX_409_CONFLICT.md](./docs/FIX_409_CONFLICT.md)

### Infinite recursion in RLS

**Problem**: Infinite recursion in Row Level Security policies.

**Solution**: Simplified RLS policies for demo version.

Details: [docs/FIX_RECURSION.md](./docs/FIX_RECURSION.md)

### Infinite notifications

**Problem**: Multiple notifications for one message.

**Solution**: Added notification tracking via `Set`.

Details: [docs/FIX_NOTIFICATIONS.md](./docs/FIX_NOTIFICATIONS.md)

---

## 🤝 Contributing

We welcome your contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

**Zhetysu State University**

- 📍 I. 187a, Ilyas Zhansugurov St., Taldykorgan
- 📧 Email: tanirbergenibrahim44@gmail.com
- 📱 Phone: +7 (776) 267-59-57

---

## 📄 License

This project was created for educational purposes as part of a university project at Zhetysu State University.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Shadcn/ui](https://ui.shadcn.com) - UI components
- [TailwindCSS](https://tailwindcss.com) - CSS framework
- [WaveSurfer.js](https://wavesurfer-js.org) - audio visualization
- [emoji-picker-react](https://github.com/ealush/emoji-picker-react) - emoji picker

---

<div align="center">

**Made with ❤️ at Zhetysu State University**

[⬆ Back to top](#-stepup-shoes---online-shoe-store)

</div>
