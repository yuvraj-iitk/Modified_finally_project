# Modified_finally_project

A simple e-commerce project with a React/JavaScript/Material UI frontend, FastAPI backend, and Keycloak authentication. It supports customer shopping, tenant product management, and admin management.

## Understand the frontend

Start with the [frontend revision guide](frontend/docs/README.md). It links to eight page READMEs explaining state, API requests, user flows, and revision questions. See the [frontend setup README](frontend/README.md) for development commands.

## Project layout

- `frontend/`: React source, Vite configuration, and page documentation.
- `backend/`: FastAPI routes, SQLAlchemy models, request schemas, and tests.
- `keycloak/`: Local Keycloak Docker Compose configuration.

## Local setup

1. In `keycloak`, copy `.env.example` to `.env`, set your local admin credentials, and run `docker compose up -d`.
2. Configure the `ecommerce` realm, `user`/`tenant`/`admin` realm roles, and public `ecommerce-frontend` client with Standard flow enabled. Register the frontend's exact root URL as both a valid login and post-logout redirect URI. Set its origin as a web origin.
3. In `backend`, create a Python virtual environment and install FastAPI, Uvicorn, SQLAlchemy, `python-jose[cryptography]`, Requests, and `python-dotenv`. Set `KEYCLOAK_ADMIN_USERNAME` and `KEYCLOAK_ADMIN_PASSWORD` in a local `.env` file.
4. Run `uvicorn main:app --reload --port 8000` from the `backend` directory. Its SQLite path is relative to the working directory.
5. Set up local roles, tenants, and accounts through the existing admin APIs using an account with the Keycloak `admin` realm role. Create the local `user` role before customer signup. SQLite data and Keycloak realm data are not included in this repository.
6. In `frontend`, run `npm ci`, then `npm run dev`. The default port is 5173. Use `npm run dev -- --port 5174` if needed, and configure Keycloak redirects/origin for that port.

Backend API documentation: http://localhost:8000/docs. Create customers through frontend Signup and sellers through Admin Users so their local database records are created alongside Keycloak accounts. The backend normalizes newly created usernames to lowercase.

## Checks

Frontend: run `npm run build` in `frontend`. Backend tests need Pytest and HTTPX installed in the backend environment; run them from `backend` with `PYTHONPATH=. python -m pytest tests`.

Credentials, databases, virtual environments, dependencies, and build output are ignored by Git. Keycloak uses development mode in this local setup.
