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
| **📂 Project Structure** | ```text\nguEMS/\n├── client/   # React + Vite frontend\n└── server/   # Express + MongoDB backend\n``` |
| **🛠️ Local Development** | **1. Clone repo**  ```bash\ngit clone https://github.com/ZiadH121/guEMS.git\ncd guEMS\n``` <br> **2. Install dependencies**  ```bash\ncd client && npm install\ncd ../server && npm install\n``` <br> **3. Setup environment variables**  - `server/.env`  ```env\nPORT=5000\nMONGO_URI=your_mongo_connection\nJWT_SECRET=your_secret\n```  - `client/.env`  ```env\nVITE_API_URL=http://localhost:5000/api\n``` <br> **4. Run backend**  ```bash\ncd server\nnode server.js\n``` <br> **5. Run frontend**  ```bash\ncd client\nnpm run dev\n``` <br> Frontend → http://localhost:5173 <br> Backend → http://localhost:5000 |
| **🌐 Deployment** | **Frontend (Vercel)** <br> - Root directory: `client` <br> - Build command: `npm run build` <br> - Output: `dist` <br><br> **Backend (Render)** <br> - Root directory: `server` <br> - Build command: `npm install` <br> - Start command: `node server.js` |

---
