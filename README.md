# Full-Stack Authentication & Workspaces App

A robust, production-ready Full-Stack Authentication Web Application built with **FastAPI**, **React (Vite)**, and **MySQL**. The entire application is fully containerized using **Docker Compose** and features an automated **CI/CD Pipeline** using **GitHub Actions** to build and push images to **Docker Hub**.

---

python -m venv myenv
source myenv/bin/activate    # On macOS/Linux
#myenv\Scripts\activate     # On Windows

Install Backend dependencies 
* ** pip install -r requirements.txt

run the fastapi server
* **
uvicorn app.auth.main:app --reload --host 0.0.0.0 --port 8000

Save and push to the GitHub 
* ** git add README.md
git commit -m "add manual non-docker setup instructions to README"
git push origin main


## 🛠 Tech Stack & Tools

* **Frontend:** React.js, Vite, CSS3 / Custom Styling
* **Backend:** FastAPI (Python), Pydantic, Passlib (Argon2), Python-Jose (JWT Authentication)
* **Database:** MySQL 8.0, SQLAlchemy ORM
* **DevOps & Infrastructure:** Docker, Docker Compose, Linux Containers
* **CI/CD:** GitHub Actions, Docker Hub

---

## 🏗 Architecture Overview

The system consists of three main containerized microservices running in an isolated Docker Network:

1. **`react_app` (Frontend):** Serves the single-page authentication interface on port `5173`.
2. **`fastapi_app` (Backend API):** Handles RESTful request routing, password hashing, JWT generation, and CORS middleware on port `8000`.
3. **`mysql_db` (Database):** Stateful MySQL database service on port `3306` with volume persistence (`mysql_data`).

---

## ⚙️ Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── auth_database.py
│   │   │   ├── main.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   └── utils.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── main.yml
├── docker-compose.yml
└── README.md
