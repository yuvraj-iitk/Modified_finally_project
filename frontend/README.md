# Simple Shop frontend

A beginner React project using JavaScript, JSX, CSS, and Material UI. It connects to the existing FastAPI backend and Keycloak.

## Learn the frontend

Start with the [frontend revision guide](docs/README.md). It links to a separate README for every page, with state explanations, API examples, user flows, and revision questions.

## Run

1. Start Keycloak from the project `keycloak` folder: `docker compose up -d`.
2. Start the backend from the project `backend` folder: `venv/bin/uvicorn main:app --reload --port 8000`. Run from this folder because the SQLite database path is relative.
3. In this `frontend` folder, run `npm install` and `npm run dev`.
4. Open http://localhost:5174/. The development server binds only to localhost and does not expose network addresses.

Vite forwards /api requests to the backend during development. The server uses port 5174 with strictPort enabled; if that port is occupied, it reports an error instead of switching ports.

Optional: copy `.env.example` to `.env` to change service URLs or the client ID. All VITE variables are browser-visible. Never add client secrets or admin credentials.

## Keycloak

The app uses the existing public `ecommerce-frontend` client in the `ecommerce` realm, standard authorization code flow with PKCE S256, and in-memory tokens. The client needs `http://localhost:5174/` as a valid redirect URI and `http://localhost:5174` as a web origin. Login opens the standard Keycloak login page. Logout returns to the frontend root URL. Add that exact URL to Valid post logout redirect URIs in Keycloak (http://localhost:5174/).

Application realm roles: `user`, `tenant`, and `admin`. Backend role checks enforce permissions; frontend checks control page navigation only. Users and sellers must also exist in the backend database. Tenant accounts must be linked to a tenant. The local `user` role and matching Keycloak realm role must exist before signup can work.

## Features

- Public product table with search, exact category filter, brand-name filter, and Previous/Next paging.
- Signup, Keycloak login/logout, role-aware navigation.
- In-memory cart with quantity controls, checkout, and order history.
- Seller product creation, editing, deletion, and a stock-only update action.
- Admin tenant/user creation and deletion, and role creation/listing.
- Loading, error, empty, and success messages; delete confirmation dialogs.

Cart contents reset on refresh/logout. Prices use the integer format returned by the backend; the API does not specify currency. Products have no image field. Order history shows product IDs because the API does not return item names or order dates. Pagination has no total count; a full final page may require clicking Next to discover the end.

## Existing backend limitations

- Order endpoints reject a requested quantity equal to remaining stock (`>=`); buying the final item returns a backend error. The frontend shows that error. Correct this to `>` in both order handlers if purchasing the final item should be supported.
- The API currently accepts empty order item lists and repeated product IDs. The frontend prevents an empty checkout and combines repeated cart additions.
- Role creation only creates a local database role; a matching realm role must exist in Keycloak before creating a user with that role.
- No API is provided for payments, shipping, order cancellation, product images, or public tenant/category lists.

## Verification

`npm run build` compiles the production bundle. For manual integration checks: browse/filter products, register a customer, log in and place an order, view history, then sign in with existing tenant/admin accounts to verify their pages and permissions. Delete actions affect real backend data, so use disposable records when testing.
