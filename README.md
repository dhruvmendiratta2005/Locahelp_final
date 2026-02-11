# LOCAHELP

Full-stack web app connecting users with local service providers.

## Stack
- Frontend: React + Vite
- Backend: Flask
- Database: MySQL

## Features
- Dual login (user/provider)
- Service listing
- Booking workflow
- Star ratings & reviews
- Help/issue reporting

## Run
Backend:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```
