# MILO

Modular Intelligence for Life Organization.

MILO is a tablet-first, ADHD-friendly personal dashboard built with React,
TypeScript, Vite, Redux Toolkit, RTK Query, and React Router.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

## Firestore Security Rules

MILO stores user-owned app data under `users/{uid}/...`. Deploy
`firestore.rules` so each signed-in user can only read and write their own
scoped documents.

## Project Structure

```txt
src/
  app/
  features/
  firebase/
  pages/
  services/
  shared/
  test/
```
