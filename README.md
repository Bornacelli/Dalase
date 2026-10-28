# Distribuciones Dalase — Catálogo virtual

PWA de catálogo para pedidos por WhatsApp, con panel de administración.

- **Frontend:** React + Vite + TypeScript
- **Datos:** Firebase Firestore + Firebase Auth (correo/contraseña)
- **Imágenes:** Cloudinary (subida sin firma desde el navegador)
- **Hosting:** Vercel (incluye 3 funciones serverless en `/api`)

---

## 1. Crear el proyecto de Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo.
2. **Authentication** → pestaña *Sign-in method* → habilita **Correo electrónico/contraseña**. No actives "Registro público": los usuarios solo se crean desde el panel admin.
3. **Firestore Database** → crea la base de datos (modo producción, elige la región más cercana).
4. **Configuración del proyecto** (ícono de engranaje) → **Tus apps** → agrega una app web (`</>`). Copia los valores que te muestra (`apiKey`, `authDomain`, etc.) — los necesitas en el paso 4 de este README.
5. **Configuración del proyecto** → pestaña **Cuentas de servicio** → botón **Generar nueva clave privada**. Se descarga un archivo `.json`: de ahí sacarás `project_id`, `client_email` y `private_key` para las funciones serverless.

### Reglas e índices de Firestore

Puedes pegarlos manualmente en la consola o usar la CLI de Firebase:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes --project TU_PROJECT_ID
```

Esto sube `firestore.rules` (permisos) y `firestore.indexes.json` (los índices que necesita la búsqueda del catálogo). Si prefieres no usar la CLI, copia el contenido de `firestore.rules` en **Firestore Database → Reglas**, y crea los índices manualmente en **Firestore Database → Índices** siguiendo los campos de `firestore.indexes.json` (o simplemente usa la app: cuando falte un índice, Firestore muestra en la consola del navegador un enlace que lo crea automáticamente).

### Crear la primera usuaria "dueña"

El panel no tiene registro público — hay que crear el primer usuario a mano, una sola vez:

1. **Authentication → Users → Add user**: escribe el correo y contraseña de tu mamá.
2. Copia el **UID** que Firebase le asigna a ese usuario.
3. **Firestore Database → Start collection** → nombre `users` → ID del documento: pega el UID copiado. Agrega estos campos:
   - `email` (string): el mismo correo
   - `role` (string): `duena`
   - `createdAt` (timestamp): ahora
   - `updatedAt` (timestamp): ahora

Con eso ya puede entrar a `/admin`. Desde ahí, en **Usuarios**, puede crear o quitar cuentas de tipo `admin` (o incluso otra `duena`) sin volver a tocar la consola de Firebase.

---

## 2. Configurar Cloudinary

1. Crea una cuenta gratuita en [cloudinary.com](https://cloudinary.com).
2. En el **Dashboard** copia el **Cloud name**, el **API Key** y el **API Secret**.
3. Ve a **Settings → Upload → Upload presets → Add upload preset**:
   - **Signing mode:** `Unsigned` (así se puede subir desde el navegador sin exponer el API secret)
   - **Asset Folder:** `dalase/productos` (opcional, pero recomendado para mantener ordenadas las imágenes en Cloudinary)
   - En **Upload restrictions** limita a `Allowed formats: jpg, png, webp` y un tamaño máximo razonable (por ejemplo 5MB)
   - Guarda y copia el **nombre del preset**

El API Key/Secret solo se usan en el servidor (funciones `/api`) para poder **borrar** imágenes, nunca en el navegador.

---

## 3. Variables de entorno

Copia `.env.example` a `.env.local` y completa todos los valores:

```bash
cp .env.example .env.local
```

- Las que empiezan con `VITE_` son públicas (van al navegador): config de Firebase, cloud name y upload preset de Cloudinary, y el número de WhatsApp de la tienda (formato internacional sin "+", ej. `573001234567`).
- Las que **no** llevan `VITE_` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`) solo las usan las funciones serverless y nunca deben llegar al navegador. Salen del JSON de la cuenta de servicio (paso 1.5) y del dashboard de Cloudinary (paso 2.2).

---

## 4. Desarrollo local

```bash
npm install
npm run dev
```

Para probar las funciones de `/api` (borrar imagen, crear/quitar administradores) localmente necesitas la CLI de Vercel:

```bash
npm install -g vercel
vercel dev
```

---

## 5. Desplegar en Vercel

1. Sube el proyecto a un repositorio de Git (GitHub, GitLab o Bitbucket).
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repositorio.
3. En **Environment Variables**, agrega **todas** las variables de `.env.example` (las `VITE_...` y las de Cloudinary/Firebase Admin) con sus valores reales.
4. Despliega. `vercel.json` ya está configurado para que todas las rutas sirvan `index.html` (necesario para que React Router maneje `/admin`, `/carrito`, etc.) y para que `/api/*` siga funcionando como funciones serverless.
5. Si usas un dominio propio, configúralo en **Settings → Domains** del proyecto en Vercel.

---

## 6. Cómo funciona la búsqueda (300+ productos)

Cada producto guarda en Firestore un campo `searchTokens`: todos los prefijos de cada palabra de su nombre (ej. "Aceite" → `ac, ace, acei, aceit, aceite`). El buscador hace **una sola consulta indexada** (`array-contains` + `orderBy` + `limit`) con la primera palabra escrita, pagina de a 20 productos con scroll infinito, y si el usuario escribió más de una palabra, afina el resultado en el propio navegador dentro de esa página. Así nunca se traen los 300+ productos de una vez, sin importar cuántas letras escriba el usuario.

## 7. PWA sin conexión

- Firestore guarda caché local persistente (IndexedDB), así que el catálogo ya visto se puede seguir viendo sin internet.
- Las fotos de Cloudinary se cachean con `vite-plugin-pwa` (estrategia *cache first*).
- Los íconos de instalación (`public/pwa-*.png`, `favicon.ico`, `apple-touch-icon.png`) ya están generados a partir del logo. Si cambias el logo, puedes regenerarlos con:

```bash
npx pwa-assets-generator --preset minimal src/assets/logo.png
```

(luego mueve los archivos nuevos de `src/assets/` a `public/`, reemplazando los existentes).

---

## Estructura del proyecto

Ver la sección de estructura de carpetas compartida al inicio del proyecto, o explora `src/` directamente: `components/` (UI), `pages/` (rutas), `firebase/` (acceso a datos), `hooks/`, `context/` (carrito y sesión), `utils/`, `types/`. Las funciones serverless están en `/api`.
