# 🎟️ AI-Powered Event Ticketing & Analytics Platform

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)

A full-stack, data-driven web application that bridges modern web development with machine learning. This platform acts as an end-to-end event management system, featuring synthetic data generation, real-time visual analytics, and a dedicated AI microservice that predicts actual event attendance based on ticket sales.

## ✨ Key Features

* **🤖 AI Attendance Predictor:** Utilizes a Linear Regression machine learning model trained on historical data to accurately forecast event turnout.
* **📊 Business Intelligence Dashboard:** Real-time data visualization using Chart.js to track total sales, scan rates, and top-performing events.
* **🌱 Synthetic Data Seeder:** Custom Node.js API route that instantly populates the MongoDB database with thousands of realistic events and ticket scans for robust testing.
* **⚡ Microservices Architecture:** Seamlessly connects a modern Next.js (JavaScript) frontend with a standalone FastAPI (Python) machine learning backend.

## 🛠️ Architecture & Tech Stack

This project is separated into two concurrent services:

**1. The Client & API Server (Next.js)**
* **Frontend:** Next.js, React, Chart.js, CSS Modules
* **Backend:** Node.js API Routes
* **Database:** MongoDB Atlas

**2. The AI Microservice (Python)**
* **Framework:** FastAPI, Uvicorn
* **Data Science:** Pandas, Scikit-Learn
* **Model:** Linear Regression (`.pkl` brain)