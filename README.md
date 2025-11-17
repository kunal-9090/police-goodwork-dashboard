🛡️ Police Good Work Dashboard — Backend
AI-Powered Smart Analytics System for Police Performance Recognition

A production-ready backend built for Odisha Police Good Work Recognition, designed to automate scoring, analytics, AI insights, GIS mapping, certificate generation, and administrative monitoring.

This project is built using the MERN stack, with a scalable, modular backend architecture.


🚀 Core Highlights
🔐 Authentication & Authorization

Secure JWT login system

Role-based access (ADMIN / OFFICER)

Password hashing using bcrypt

Token-based protected routes

Admin-only & officer-only endpoints


🗄️ Database (MongoDB Atlas)

Centralized collections:

User (Admin + Officer)

NDPS (with geo-coordinates)

Certificates

Withdrawals

PoliceStations

Analytics Cache

Admin System Logs

Supports future extensions like:

Missing Persons

NBW Execution

Convictions

Illegal Firearms

Cyber Crime


🏅 Points & Rewards System

The platform rewards officers based on good work.

✔ How points work

Auto-calculated from NDPS case metrics

Admin approval adds points permanently

Points visible in leaderboard

Redemption allowed (1 Point = ₹100)


📊 Analytics & Reporting (Modules 3, 9, 10)

Admin gets intelligent insights:


📌 Basic Analytics

Total cases

Seizures summary

Monthly case graphs

District-wise performance


📌 Station-Level Analytics

Beat officer performance

Station heatmaps

Station case count


📌 AI Insights

Predict high-risk districts

Hotspot detection

Trend forecasting

Suggested patrol routes (future)


🗺️ GIS System (GeoJSON + Heatmaps + Choropleth)

Full Odisha district GeoJSON

NDPS entries with longitude + latitude

Heatmap-ready API

District boundary API

Map-based admin dashboard



🎖️ Certificate Generation (Module 6)

Auto-generate PDF certificate using PDFKit

Unique certificate ID

QR Code for verification

Download via secure URL

Stored locally (/certificates/)



🧾 Withdrawal Management (Module 5)

Officers request rewards redemption

Admin approves / rejects

Auto point deduction

Secure history logs




🧑‍💼 Admin Dashboard API (Module 7)

Admin can:

Approve NDPS entries

Approve withdrawals

View officers

View district trends

View system logs

Trigger AI reports



🔥 AI Predictive Policing (Module 10)

AI endpoints provide:

Hotspot predictions

Risk scoring

District risk maps

Trend summary

Future cases forecast

All endpoints return JSON, ready for frontend integration.



🧱 Project Folder Structure

backend/
│── config/
│   └── db.js
│── controllers/
│   └── ndpsController.js
│   └── leaderboardController.js
│   └── analyticsController.js
│   └── withdrawalController.js
│   └── certificateController.js
│   └── stationController.js
│   └── aiController.js
│── middleware/
│   └── authMiddleware.js
│   └── roleMiddleware.js
│── models/
│   └── User.js
│   └── NDPS.js
│   └── Certificate.js
│   └── Withdrawal.js
│   └── PoliceStation.js
│── routes/
│   └── authRoutes.js
│   └── ndpsRoutes.js
│   └── leaderboardRoutes.js
│   └── analyticsRoutes.js
│   └── withdrawalRoutes.js
│   └── certificateRoutes.js
│   └── stationRoutes.js
│   └── gisRoutes.js
│   └── aiRoutes.js
│── gis/
│   └── districts.geojson
│── utils/
│   └── generateCertificate.js
│── certificates/
│── .env
│── .gitignore
│── package.json
│── server.js
│── README.md
