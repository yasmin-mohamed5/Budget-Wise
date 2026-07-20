<div align="center">

<img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge" />

# 💸 BudgetWise

### *Your money. Your rules. Your data.*

**A full-stack personal finance platform** that helps you track income, manage expenses, set budget limits, and visualize your financial goals — all secured with enterprise-grade authentication.

🌐 **[Live Demo → budget-wisefcai.vercel.app/](https://budget-wisefcai.vercel.app/)**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)
[![Leapcell](https://img.shields.io/badge/Leapcell-6C47FF?style=for-the-badge&logo=cloud&logoColor=white)](https://leapcell.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

---

## 🎯 The Problem We Solved

Most people don't overspend because they're careless — they overspend because they **can't see** where their money goes until it's already gone. BudgetWise changes that.

We built a platform that gives you **real-time financial awareness**: track every transaction, set category budgets with automatic over-limit alerts, and visualize your savings goals — all in one place, all in real time.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login with bcrypt password hashing and HTTP-only cookies |
| 💰 **Transaction Tracking** | Log income and expenses with categories, dates, and descriptions |
| 📊 **Budget Management** | Set monthly spending limits per category with real-time tracking |
| 🚨 **Smart Alerts** | Automatic notifications when you approach (80%) or exceed (100%) your budget |
| 🎯 **Financial Goals** | Set savings targets with progress tracking and completion percentages |
| 📈 **Reports & Analytics** | Visual breakdowns of spending patterns with pie, doughnut, and bar chart data |
| 📄 **Swagger API Docs** | Fully documented REST API — interactive and explorable via Swagger UI |
| 🔒 **Middleware Security** | Route-level JWT verification protecting all sensitive endpoints |
| 📱 **Responsive UI** | Mobile-friendly design with a slide-out nav menu for small screens |

---

## 🚀 Try It Now

No setup required. The app is fully deployed and ready to use:

| Resource | URL |
|---|---|
| 🌐 **Frontend (Netlify)** | [budgetwise-fcai.netlify.app](https://budgetwise-fcai.netlify.app/) |
| ⚙️ **Backend API (Leapcell)** | Hosted on Leapcell — connected automatically |
| 📖 **API Docs (Swagger)** | Available on the running backend at `/api-docs` |
| 🎬 **Video Tutorial** | [Watch on YouTube](https://youtu.be/1y7H2B9Xp8Q?si=D6lz-SW68eYNyOwg) |

> Just visit the link, create an account, and start tracking. No configuration needed.

---

## 🏗️ Architecture

```
BudgetWise/
├── backEnd/                    # TypeScript · Express 5 · MongoDB
│   └── src/
│       ├── controllers/        # Business logic layer (MVC)
│       ├── models/             # Mongoose schemas & data models
│       ├── routes/             # RESTful API route definitions
│       ├── middleware/         # JWT auth, error handling, logging
│       ├── services/           # Service layer (BudgetService, ReportService, etc.)
│       ├── classes/            # Domain classes (FinancialGoal)
│       └── app.ts              # App entry point
│
└── frontEnd/                   # HTML · CSS · Vanilla JavaScript
    ├── pages/                  # Application views (transactions, budgets, goals, reports)
    └── assets/                 # Styles & static resources
```

**Design Patterns Applied:**
- 🏛️ **MVC (Model-View-Controller)** — clean separation of data, logic, and presentation
- 🛡️ **Middleware Pattern** — `verifyToken` intercepts and validates JWT on every protected route
- 📦 **Service Layer Pattern** — business logic abstracted behind dedicated service classes (BudgetService, TransactionService, ReportService, FinancialGoalService)
- 🔗 **Discriminator Pattern** — `Income` and `Expense` extend the base `Transaction` model via Mongoose discriminators
- ✅ **SOLID Principles** — each service, controller, and model has a single, well-defined responsibility

---

## 🔌 API Overview

All endpoints are fully documented via **Swagger UI** at `/api-docs` on the running backend.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Create a new user account | ❌ |
| `POST` | `/auth/login` | Login and receive JWT | ❌ |
| `POST` | `/auth/logout` | Invalidate session | ✅ |
| `GET` | `/transactions` | Fetch all user transactions | ✅ |
| `POST` | `/transactions` | Add a new transaction | ✅ |
| `PUT` | `/transactions/:id` | Edit a transaction | ✅ |
| `DELETE` | `/transactions/:id` | Delete a transaction | ✅ |
| `GET` | `/transactions/categories` | Fetch all categories | ✅ |
| `POST` | `/transactions/categories` | Create a custom category | ✅ |
| `DELETE` | `/transactions/categories/:id` | Delete a custom category | ✅ |
| `GET` | `/budgets` | Fetch budget limits & status | ✅ |
| `POST` | `/budgets` | Create a budget | ✅ |
| `PUT` | `/budgets/:id` | Update a budget | ✅ |
| `DELETE` | `/budgets/:id` | Delete a budget | ✅ |
| `GET` | `/goals` | Fetch all financial goals | ✅ |
| `POST` | `/goals` | Create a new savings goal | ✅ |
| `PATCH` | `/goals/:id/progress` | Update goal progress | ✅ |
| `DELETE` | `/goals/:id` | Delete a goal | ✅ |
| `GET` | `/reports` | Generate financial report data | ✅ |

> ✅ = Requires `Authorization: Bearer <token>` header or HTTP-only cookie

---

## 🛠️ Tech Stack

### Backend
| Technology | Role |
|---|---|
| **TypeScript** | Type-safe server-side development |
| **Node.js + Express 5** | HTTP server & RESTful routing |
| **MongoDB + Mongoose** | NoSQL database with schema validation and discriminators |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing & salting (12 rounds) |
| **Swagger (JSDoc + UI)** | Auto-generated interactive API documentation |
| **Morgan** | HTTP request logging middleware |
| **dotenv** | Environment variable management |
| **Leapcell** | Cloud hosting platform for the backend server |

### Frontend
| Technology | Role |
|---|---|
| **HTML5 + CSS3** | Responsive layout and styling |
| **Vanilla JavaScript** | Dynamic UI interactions & API integration |
| **Chart.js** | Interactive financial charts (doughnut, bar, line) |
| **Netlify** | Frontend hosting and continuous deployment |

---

## 🔒 Security Highlights

- **Brute-force protection** — login attempts are tracked per email; 5 failed attempts triggers a 5-minute lockout
- **Password strength enforcement** — requires uppercase, lowercase, and a digit; minimum 8 characters
- **HTTP-only cookies** — JWT stored in cookies with `secure` and `sameSite: none` flags
- **Route-level auth middleware** — `verifyToken` applied across all protected routes
- **Case-insensitive email deduplication** — prevents duplicate accounts with different casing

---

## 📐 Software Design Artifacts

This project was backed by comprehensive software engineering documentation:

- 📊 **UML Class Diagram** — Full entity relationships and method signatures
- 🔄 **Sequence Diagrams** — 7 user stories including Sign-Up, Login, Add Transaction, Budget Alerts, and Goal Tracking
- 🗺️ **State Diagram** — Complete user account lifecycle (Unregistered → Authenticated → Session Expired → Locked Out)
- 🏛️ **3-Tier Architecture Diagram** — Presentation, Application, and Data tier components
- 📋 **Software Design Specification (SDS)** — Full HLD documentation

🔗 **View all software design artifacts:** [Documentation](https://drive.google.com/drive/folders/12UdbQdpYUvn4CYsKlXoDCxYD3pRE-QyY?usp=drive_link)

---

## 👥 Team

| Name | Role | GitHub | LinkedIn |
|------|------|--------|----------|
| **Yasmin Mohamed Nabil** | Full-Stack · Class Diagram Design | [@yasmin-mohamed5](https://github.com/yasmin-mohamed5) | [LinkedIn](https://www.linkedin.com/in/yasmin-mohamed-react) |
| **Mario Nasser Fawzy** | Full-Stack · System Architecture | [@Mario-Nasser](https://github.com/Mario-Nasser) | [LinkedIn](https://www.linkedin.com/in/mario-nasser-60b02834b) |
| **Lojain Mohammed Abu Elhassan** | Full-Stack · Sequence Diagram Design | [@lojymohamad123](https://github.com/lojymohamad123) | [LinkedIn](https://www.linkedin.com/in/lojain-mohamed-873125326) |

*Built as part of CS251: Software Engineering — Cairo University, FCAI*

---

<div align="center">

*If this project helped you or impressed you, consider giving it a ⭐ — it means a lot to a team of CS sophomores building real things.*

</div>
