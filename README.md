<div align="center">

<img src="public/images/tasqx-logo.svg" alt="TasqX Logo" width="120" height="120" />

# ⚡ TasqX — Next-Gen Agile Project & Task Management

**Next-Gen Agile Project Management powered by Supabase, Next.js & Linear-inspired Design.**

[![Next.js](https://img.shields.io/badge/Next.js-13.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-4.14-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v4-FF4154?style=flat-square&logo=react-query)](https://tanstack.com/query)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](http://localhost:3000) · [Report Bug](https://github.com/jin-kazama-codes/tasqX.io/issues) · [Request Feature](https://github.com/jin-kazama-codes/tasqX.io/issues)

</div>

---

## 🌟 Overview

**TasqX** is a modern, blazing-fast, Linear-inspired agile project management platform designed for engineering teams that value speed, clarity, and visual excellence. Built with Next.js 13 App Router, Supabase PostgreSQL, Prisma ORM, and TanStack React Query, TasqX provides everything agile teams need from backlog refinement to sprint retrospectives.

---

## ✨ Features

### 🎯 Agile Hierarchy & Task Tracking
- **Full Hierarchy**: ⚡ **Epics** $\rightarrow$ 🔖 **Stories** $\rightarrow$ 🎯 **Tasks** $\rightarrow$ 🔴 **Bugs** $\rightarrow$ 🔀 **Subtasks**.
- **Interactive Kanban Board**: Fluid drag-and-drop workflow transitions (`To Do` $\rightarrow$ `In Progress` $\rightarrow$ `Done`) with real-time status updates.
- **Sprint Management & Backlogs**: Create sprints, drag tasks between backlogs and active sprints, and start/complete sprint cycles with a single click.
- **Roadmap & Timeline**: Visual milestone planning with Epic tracking spanning across sprints.

### 🎨 Design & Experience
- **Linear-Inspired UI**: Indigo/Violet color palette, glassmorphism cards, ambient glowing gradients, and smooth micro-animations.
- **Dark & Light Mode**: Seamless theme toggle with full system preferences synchronization.
- **Interactive Task Modal**: Rich Lexical description editor, activity streams (comments & worklogs), time estimation, and progress tracking.
- **Custom Project Icons**: 12 curated project icons/emojis (`🚀`, `⚡`, `🤖`, `🌐`, `📱`, `🎨`, `🔒`, `💎`, `🎯`, `🔥`, `🛠️`, `💼`) for workspace personalization.

### 📊 Analytics & Collaboration
- **Sprint Reports**: Automated **Burndown Charts** and **Velocity Reports** powered by Highcharts.
- **Document Management**: Project asset and document repository with folder organization and direct downloads.
- **Team & Permissions**: Role-based access management with **Admin**, **Manager**, and **Member** permissions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 13](https://nextjs.org/) (App Router & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Custom Design Tokens
- **Database & Auth**: [Supabase](https://supabase.com/) & PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Data Fetching**: [TanStack Query v4](https://tanstack.com/query)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Charts**: [Highcharts React](https://github.com/highcharts/highcharts-react)
- **Rich Text**: [Lexical](https://lexical.dev/)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/jin-kazama-codes/tasqX.io.git
cd tasqX.io
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database and Supabase credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_KEY"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Push database schema & seed
```bash
npx prisma db push
node prisma/seed-demo.js
node prisma/seed-epics.js
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@tasqx.io` | `password123` |
| **Manager** | `alex@tasqx.io` | `password123` |
| **Member** | `sarah@tasqx.io` | `password123` |

---

## 👨‍💻 Author

**Aafaq Ahmad**
- GitHub: [@jin-kazama-codes](https://github.com/jin-kazama-codes)
- Project Repository: [tasqX.io](https://github.com/jin-kazama-codes/tasqX.io)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
