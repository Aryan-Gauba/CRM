# 🚀 Enterprise CRM System

A full-stack, multi-tenant Customer Relationship Management (CRM) platform built to streamline lead management, customer interactions, team collaboration, and AI-driven business insights.

---

## 🛠️ Tech Stack

### **Frontend**
* ![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) **Framework:** React + Vite
* ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) **Styling:** Tailwind CSS / Modern UI Components
* ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) **Routing:** React Router DOM
* ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) **HTTP Client:** Axios (with custom interceptors for token management)
* ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white) **Real-Time Communication:** Socket.io-client
* ![Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) **Hosting:** Vercel

### **Backend**
* ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) **Runtime:** Node.js & Express.js
* ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) **Database Management:** PostgreSQL (Hosted on Neon)
* ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white) **Real-Time Engine:** Socket.io (Multi-tenant room isolation)
* ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) **Authentication:** JSON Web Tokens (JWT) & Bcrypt hashing
* **AI Integration:** Groq SDK
* ![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white) **Hosting:** Render (Free tier)

---

## ✨ Key Features

* **Multi-Tenant Organization Management:** Isolate workspaces, data, and teams securely.
* **Lead & Customer Pipeline:** Track leads, conversion stages, customer histories, and deals won/lost.
* **Real-Time Team Chat:** Instant messaging powered by WebSockets (`Socket.io`) mapped to specific organization channels.
* **AI Insights:** Leverage Groq API integration for intelligent data processing and task streamlining.
* **Task & Notification Center:** Keep track of operational metrics, call logs, and email communications.
* **Responsive Dashboard:** Real-time analytics and graphical sales pipeline distributions.

---

## ⚙️ Architecture & Deployment Setup

This project uses a **split-repo architecture** deployed across specialized cloud platforms for zero-cost, persistent production hosting:
* **Frontend:** Hosted on **Vercel** as a single-page application pointing to a dynamic API base URL.
* **Backend:** Hosted on **Render** as a persistent Node.js web service keeping Express and WebSockets active.
* **Database:** Managed relational storage via **Neon PostgreSQL**.

---

## 📐 Architecture Design

The CRM system follows a decoupled **Client-Server Architecture** utilizing a split deployment model to achieve free, persistent production hosting without requiring credit card details.

### **System Architecture Diagram**

```text
 +---------------------------------------------------------------+
 |                        Vercel (Hosting)                       |
 |  [ React + Vite SPA ]  ---(HTTPS / REST)----> [ Render (API) ]|
 |  [ Client Browser ]    ---(WebSockets)-----> [ Express / Socket ]|
 +---------------------------------------------------------------+
                                                       |
                                                  (Neon Driver)
                                                       v
                                       +-------------------------------+
                                       |      Neon (PostgreSQL DB)     |
                                       |  [ Multi-Tenant Relational ]  |
                                       +-------------------------------+
```

### 📂 Repository Architecture (Directory Structure)

The repository is organized in a monorepo layout, clearly separating the frontend client application from the backend server logic:

```text
CRM/
├── client/                     # Frontend Application (Vercel Deployment)
│   ├── public/                 # Static assets and favicons
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context providers (e.g., AuthContext)
│   │   ├── services/           # API integration (api.js) and WebSocket client (socket.js)
│   │   ├── App.jsx             # Main application layout and router configurations
│   │   └── main.jsx            # React root mount entry point
│   ├── package.json            # Frontend dependencies (React, Vite, Tailwind, etc.)
│   └── vite.config.js          # Vite configuration file
│
├── server/                     # Backend Application (Render Deployment)
│   ├── config/                 # Database configuration and connection pools (db.js)
│   ├── controllers/            # Business logic handlers for routes
│   ├── routes/                 # Express API routers (authRoutes, leadRoutes, chatRoutes, etc.)
│   ├── server.js               # Express application entry point, middleware setup, & Socket.io engine
│   └── package.json            # Backend dependencies (Express, Socket.io, pg, dotenv, etc.)
│
└── README.md                   # Project documentation
```
