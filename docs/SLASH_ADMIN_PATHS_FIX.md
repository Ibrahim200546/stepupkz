# Исправление путей импорта для Slash Admin

## Проблема

Slash Admin использует импорты вида:
```tsx
import Logo from "@/components/logo";
import { useSettings } from "@/store/settingStore";
```

Эти пути должны указывать на `src/admin-panel/`, но сейчас `@/` указывает на `src/`.

## Решения

### Вариант 1: Временно используйте старую админку ✅ РАБОТАЕТ

```
http://localhost:8080/admin-old
```

Старая админка полностью функциональна и использует Supabase.

### Вариант 2: Исправить пути вручную (трудоемко)

Заменить все импорты в `src/admin-panel/` с `@/` на относительные пути или `@admin/`.

**Пример:**
```tsx
// Было:
import Logo from "@/components/logo";

// Стало:
import Logo from "./components/logo";
// или
import Logo from "@admin/components/logo";
```

Количество файлов для изменения: ~200+

### Вариант 3: Настроить Vite plugin (сложно)

Создать кастомный Vite plugin который будет:
1. Определять контекст импорта
2. Если импорт из `admin-panel/`, резолвить `@/` → `src/admin-panel/`
3. Если из других файлов, резолвить `@/` → `src/`

Проблема: Vite не поддерживает контекстные алиасы out of the box.

### Вариант 4: Использовать отдельный Vite config для admin-panel

Создать `src/admin-panel/vite.config.ts` с правильными путями и собирать админку отдельно.

### Вариант 5: Переписать импорты через скрипт

Создать Node.js скрипт который автоматически заменит все `@/` на относительные пути.

```js
// replace-imports.js
const fs = require('fs');
const path = require('path');

function replaceImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Заменить @/ на относительные пути
  content = content.replace(
    /import\s+(.+)\s+from\s+['"]@\//g,
    (match, imports) => {
      // Вычислить относительный путь
      return `import ${imports} from ".../`;
    }
  );
  
  fs.writeFileSync(filePath, content);
}

// Пройтись по всем файлам в admin-panel
```

## Рекомендация ✅

**Используйте старую админку:**
```
http://localhost:8080/admin-old
```

Она полностью функциональна и включает:
- Dashboard с статистикой
- User management
- Product management  
- Order management
- Vendor management
- Chat management
- Reports

## Для разработчиков

Если хотите исправить пути:

1. Создайте ветку: `git checkout -b fix/slash-admin-paths`
2. Используйте find & replace для замены импортов
3. Тестируйте после каждой замены

**Паттерны для замены:**
```
Find: from "@/components/
Replace: from "../components/

Find: from "@/hooks"
Replace: from "../hooks"

Find: from "@/store/
Replace: from "../store/

Find: from "@/layouts/
Replace: from "../layouts/

Find: from "@/pages/
Replace: from "../pages/

Find: from "@/utils/
Replace: from "../utils/

Find: from "@/types/
Replace: from "../types/

Find: from "@/assets/
Replace: from "../assets/
```

## Статус

- ❌ Slash Admin (`/admin`) - недоступен из-за путей
- ✅ Старая админка (`/admin-old`) - полностью работает
- ✅ Тест страница (`/admin-test`) - работает
- ✅ Admin access control - работает
- ✅ Supabase integration - работает

## Следующие шаги

1. Используйте `/admin-old` для админ функций
2. При необходимости Slash Admin - исправьте пути вручную
3. Или дождитесь обновления с исправленными путями
