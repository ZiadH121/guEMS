# 🎟️ Galala EMS (MVP)

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)  
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb)](https://www.mongodb.com/atlas)  
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)  
[![Render](https://img.shields.io/badge/Backend-Render-blueviolet?logo=render)](https://render.com/)  

The **Galala Event Management System (EMS)** is a MERN-based MVP designed to handle event creation, ticket booking, venue reservations, and attendance tracking for universities and research facilities.

---

## 📂 Project Structure
```

guEMS/
├── client/   # React + Vite frontend
└── server/   # Express + MongoDB backend

````

- **Frontend**: React 19, Vite, React Router, Bootstrap  
- **Backend**: Express, MongoDB (Atlas), JWT Auth  
- **Deployment**: Vercel (frontend) + Render (backend)  

---

## 🛠️ Local Development

1. **Clone repo**
   ```bash
   git clone https://github.com/ZiadH121/guEMS.git
   cd guEMS
````

2. **Install dependencies**

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Setup environment variables**

   * `server/.env`

     ```
     PORT=5000
     MONGO_URI=your_mongo_connection
     JWT_SECRET=your_secret
     ```
   * `client/.env`

     ```
     VITE_API_URL=http://localhost:5000/api
     ```

4. **Run backend**

   ```bash
   cd server
   node server.js
   ```

5. **Run frontend**

   ```bash
   cd client
   npm run dev
   ```

Frontend runs at → `http://localhost:5173`
Backend runs at → `http://localhost:5000`

---

## 🌐 Deployment

* **Frontend (Vercel)**

  * Root directory: `client`
  * Build command: `npm run build`
  * Output: `dist`

* **Backend (Render)**

  * Root directory: `server`
  * Build command: `npm install`
  * Start command: `node server.js`

---
