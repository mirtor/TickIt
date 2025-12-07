# Tickit — Tasks & Notes

A lightweight **Tasks + Notes** app built with **Vue 3 + TypeScript + Vite** and powered by **Firebase (Auth + Firestore)**.  
Designed for personal use with a clean, mobile-friendly UI and cross-device sync.

---

## Features

- Firebase Authentication
- Create, edit, delete:
  - **Tasks**
  - **Notes**
  - **Subtasks**
- Independent tabs for **Tasks** and **Notes**
- Task detail modal with:
  - Pending/completed subtasks
  - Add and edit subtasks from inside the task flow
- **Manual ordering** of tasks and notes using **↑ / ↓ buttons** (order is persisted)
- Notes with **bullet-style editing**
  - New line → new bullet
  - Double new line → subtle separator
- PWA-ready for installable experience

---

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Firebase Auth
- Cloud Firestore
- PWA via `vite-plugin-pwa`

---

## Project Setup

### Install

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

**Notes**
- `.env.local` is ignored by Git by default.
- This setup is recommended if you want the repository to be public.

---

## Development

```bash
npm run dev
```

Starts the Vite dev server with HMR.

---

## Build

```bash
npm run build
```

Runs type checking and produces a production build in `dist/`.

---

## Preview Production Build

```bash
npm run preview
```

Serves the local production build.

---

## NPM Scripts

```json
{
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview"
}
```

---

## Deployment

This project is intended for **Firebase Hosting**.  
It can be deployed manually with the Firebase CLI or automatically via **GitHub Actions**.

Typical flow:
1. Push to `main`
2. CI installs deps
3. CI runs `npm run build`
4. CI deploys to Firebase Hosting

---

## Data Model (High-Level)

A single `tasks` collection is used, where each document contains:
- `userId`
- `type`: `task | note`
- `title`
- `description` (notes)
- `subtasks` (tasks)
- `order`
- timestamps

This keeps the app simple and works well for personal/multi-device usage.

---

## Disclaimer

This is a compact productivity app focused on simplicity and speed.  
The codebase is intentionally straightforward to allow easy extension.

---

## License

Personal / educational use.
