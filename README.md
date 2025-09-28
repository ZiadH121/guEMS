# 🎟️ Galala EMS (MVP)

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)  
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb)](https://www.mongodb.com/atlas)  
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)  
[![Render](https://img.shields.io/badge/Backend-Render-blueviolet?logo=render)](https://render.com/)  

The **Galala Event Management System (EMS)** is a MERN-based MVP designed to handle event creation, ticket booking, venue reservations, and attendance tracking for universities and research facilities.

---

| Section | Details |
|---------|---------|
| **📂 Project Structure** | ```<br>guEMS/<br>├── client/   # React + Vite frontend<br>└── server/   # Express + MongoDB backend<br>``` |
| **🛠️ Local Development** | **1. Clone repo**<br>```bash<br>git clone https://github.com/ZiadH121/guEMS.git<br>cd guEMS<br>```<br><br>**2. Install dependencies**<br>```bash<br>cd client && npm install<br>cd ../server && npm install<br>```<br><br>**3. Setup environment variables**<br>- `server/.env`<br>```<br>PORT=5000<br>MONGO_URI=your_mongo_connection<br>JWT_SECRET=your_secret<br>```<br>- `client/.env`<br>```<br>VITE_API_URL=http://localhost:5000/api<br>```<br><br>**4. Run backend**<br>```bash<br>cd server<br>node server.js<br>```<br><br>**5. Run frontend**<br>```bash<br>cd client<br>npm run dev<br>```<br><br>Frontend → `http://localhost:5173`<br>Backend → `http://localhost:5000` |
| **🌐 Deployment** | **Frontend (Vercel)**<br>- Root directory: `client`<br>- Build command: `npm run build`<br>- Output: `dist`<br><br>**Backend (Render)**<br>- Root directory: `server`<br>- Build command: `npm install`<br>- Start command: `node server.js` |

---
