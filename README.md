🛡️ Police Good Work Dashboard — Backend
AI-Powered Smart Analytics System for Police Performance Recognition

A full-stack MERN project designed for Odisha Police Good Work Recognition, featuring:

✔ Role-based login (Admin + Officer)
✔ JWT authentication
✔ MongoDB Atlas integration
✔ Secure middleware
✔ Extendable modules for NDPS, NBW, Missing Persons, Convictions, etc.
✔ Point-based reward system (1 Point = ₹100 redeemable cash)

🚀 Features (Backend)
🔐 Authentication & Authorization

Secure JWT-based login

Register users (Admin / Officer)

Role-based access endpoints (ADMIN_ONLY, OFFICER_ONLY)

Password hashing using bcrypt

🗄 Database

Hosted on MongoDB Atlas

Centralized Officer & Admin collections

Future-ready schemas for:

NDPS Cases

NBW Execution

Convictions

Missing Persons

Illegal Firearms

Good Work Entries

🏅 Points & Rewards System

Officers earn points based on case severity

Admin approves entries

Points can be redeemed (1 point = ₹100)

Supports monthly and weekly scoring

📊 Reporting System (Upcoming)

Auto-generate PDF reports

Export Excel summaries

Trend charts: district-wise, drive-wise

AI-powered natural language insights

📁 Folder Structure
backend/
│── config/
│   └── db.js
│── controllers/
│── middleware/
│   └── authMiddleware.js
│── models/
│   └── User.js
│── routes/
│   └── authRoutes.js
│── node_modules/
│── .env
│── .gitignore
│── package.json
│── server.js
│── README.md

🔧 Tech Stack
Technology	Purpose
Node.js	Runtime
Express.js	Server framework
MongoDB Atlas	Cloud database
Mongoose	ODM
JWT	Authentication
bcryptjs	Password hashing
CORS	Cross-origin security
Nodemon	Development runner
