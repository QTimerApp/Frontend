# QTimer - Frontend

A modern Rubik's Cube timer for speedcubers. Track solves, analyse averages, and improve your times.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Zustand**, **TanStack Query**, and **Dexie.js**.

## Features

- Precision timer with manual entry
- Session management with side-by-side navigation
- Real-time statistics (averages, trends, consistency, PBs)
- Activity calendar and milestone tracking
- Offline-first - local IndexedDB as source of truth
- Cloud sync in the background (never blocks the timer)
- Mobile-optimized layout with bottom nav and slide-out sessions
- Customizable themes, scramble types, and notification settings

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
app/             - Next.js App Router pages and layouts
components/      - Shared UI components (icons, modals, ui primitives)
features/        - Feature modules (timer, sessions, statistics, settings, profile)
lib/             - Core logic (stores, hooks, services, repositories, utils)
types/           - TypeScript type definitions
constants/       - App-wide constants
public/          - Static assets
```

## Design Principles

- **Offline-first** - local state is the source of truth during active use
- **Mobile-first** - mobile is not a scaled-down desktop experience
- **Performance** - timer responsiveness is the highest priority
- **Minimal UI** - clean, modern, clutter-free interface
