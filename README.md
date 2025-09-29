# Task Manager & CSV Duplicate Finder

This web application combines **three coding challenges** into a single project, demonstrating full-stack skills, frontend interactivity, and backend processing. The app is fully deployed and ready to use.

---

### **Challenge 1: Task Management (CRUD)**
- Built a **REST API** with Node.js + Express connected to **PostgreSQL**.
- Features:
  - Create, read, update, and delete tasks.
  - Tasks are **stored in a PostgreSQL database**, ensuring persistence across sessions and devices.
- Challenge: Implement full CRUD operations with proper database integration, validation, and error handling.

### **Challenge 2: Drag & Drop Task Reordering**
- Enable users to **reorder tasks in the frontend** using drag & drop.
- Task order is **stored in the database**, so changes persist.
- Challenge: Synchronize frontend interactions with backend storage while maintaining smooth drag & drop behavior.

### **Challenge 3: CSV Duplicate Finder**
- Build a backend-powered feature to **find duplicate rows in large CSV files (1000+ rows)**.
- Users can specify **one or more columns** for duplicate checking.
- Built using **Node.js + Express** for file handling and **Python + pandas** for processing.
- Challenge: Handle large files efficiently, validate input columns, and provide **clear error messages** for:
  - Missing or empty CSV
  - Wrong column names
  - Empty duplicates
  - Other unexpected errors

---

## How It Works

1. **Task Manager**
   - Frontend in **React**, backend in **Node.js + Express**, database is **PostgreSQL**.
   - CRUD operations for tasks are fully functional.
   - Tasks can be reordered using drag & drop, with order persisted in the database.

2. **CSV Duplicate Finder**
   - Users upload a CSV file and specify columns to check.
   - Backend runs a Python script to find duplicates.
   - Returns results in **JSON format** for display on the frontend.
   - Provides **clear error messages** for all invalid inputs.
---
