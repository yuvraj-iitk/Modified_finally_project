# Frontend revision guide

Start here to understand the code. Each page guide explains the current implementation, rather than a planned feature. Example IDs and data are illustrative.

## Page guides

| Browser route | Component | Guide | Who can open it? |
| --- | --- | --- | --- |
| `/` | `Products.jsx` | [Products](pages/products/README.md) | Everyone |
| `/signup` | `Signup.jsx` | [Signup](pages/signup/README.md) | Everyone |
| `/cart` | `Cart.jsx` | [Cart](pages/cart/README.md) | Everyone; checkout needs a customer or tenant login |
| `/orders` | `MyOrders.jsx` | [My orders](pages/my-orders/README.md) | `user` or `tenant` |
| `/seller` | `SellerProducts.jsx` | [My products](pages/seller-products/README.md) | `tenant` |
| `/admin/tenants` | `Admin.jsx`, `kind="tenants"` | [Admin tenants](pages/admin-tenants/README.md) | `admin` |
| `/admin/users` | `Admin.jsx`, `kind="users"` | [Admin users](pages/admin-users/README.md) | `admin` |
| `/admin/roles` | `Admin.jsx`, `kind="roles"` | [Admin roles](pages/admin-roles/README.md) | `admin` |

## How the application starts

1. [index.html](../index.html) provides `<div id="root">` and loads the entry script.
2. [main.jsx](../src/main.jsx) renders React into that element. It adds the Material UI theme, CSS reset, router, authentication provider, and cart provider around `App`.
3. [App.jsx](../src/App.jsx) displays the navbar and chooses a page using the URL.
4. The selected page reads shared data using `useAuth()` or `useCart()`, manages its own state, and calls `api()` when it needs backend data.
5. Changing state makes React render the affected UI again.

There is no separate React login page. Login and logout go to Keycloak through `AuthContext`.

## Shared files to revise

| File | What to understand |
| --- | --- |
| [App.jsx](../src/App.jsx) | Routes, role-aware links, and the `ProtectedRoute` function. Unknown routes redirect to `/`. Admin pages use one component with different `kind` values and keys. |
| [AuthContext.jsx](../src/context/AuthContext.jsx) | Initializes Keycloak once with a shared promise; uses `GET /me` after authenticated initialization; exposes `user`, `loading`, `error`, `login`, and `logout`. Both redirects use the current origin followed by `/`. |
| [keycloak.js](../src/keycloak.js) | Creates one Keycloak instance with URL, realm, and public client ID from environment variables or defaults. |
| [CartContext.jsx](../src/context/CartContext.jsx) | Shares an in-memory item list. `add` combines repeated products; `change` clamps quantities; `remove` filters one item; `clear` resets the list. Navbar count is total units, not distinct products. |
| [api.js](../src/api.js) | Central request helper. Protected requests refresh the token if needed and add a bearer header. Bodies become JSON; errors become readable messages. Public requests explicitly set `protectedRequest: false`. |
| [Common.jsx](../src/components/Common.jsx) | `Status` displays loading/errors/success; `DataTable` supplies table headings and accepts rows as children; `ConfirmDelete` opens when its target exists. |
| [styles.css](../src/styles.css) | Simple page spacing, forms, wrapping toolbars/navbar, and table-cell spacing. Most individual component styling uses Material UI's `sx` prop. |
| [vite.config.js](../vite.config.js) | Enables automatic JSX conversion and forwards development `/api` requests to port 8000, removing `/api` from the path. |

## Follow an API request

For example, `api('/orders/me')` makes the browser request `/api/orders/me` by default. Vite forwards it to `http://localhost:8000/orders/me`. If `VITE_API_URL` is set, that URL replaces `/api`; direct requests then depend on backend CORS settings. The Vite proxy is for the development server. A deployed frontend needs a corresponding proxy or an explicit API URL.

`api()` defaults to GET and a protected request. It checks authentication, calls `updateToken(30)`, and adds the current token. A failed HTTP response throws an error. Pages catch that error and put its message into state; `Status` displays it.

## React and JavaScript revision notes

- `useState`: remembers a value between renders. Calling its setter updates the UI.
- `useEffect`: runs after rendering, usually to load data. An empty dependency array runs on mounting; `[filters, page]` reloads when either changes.
- Controlled input: `value` comes from state and `onChange` updates that state.
- `e.preventDefault()`: prevents a form submission from reloading the entire page.
- `map`: converts products into table rows or cart items into request items.
- `find`: locates a role, tenant, or existing cart entry. `filter` removes entries. `reduce` calculates totals.
- `{ ...form, [field]: value }`: copies the form and changes one field, avoiding direct mutation.
- `Number(value)`: converts the string from an input into a number before sending JSON.
- `try/catch/finally`: handles success, handles failure, then releases the busy/loading state.
- `Promise.all`: starts independent requests together and waits for both; either failure rejects the combined operation.
- `condition && <Component />`: displays something only if the condition is true.
- `condition ? first : second`: chooses one of two UI branches.
- `key`: gives each list item a stable identity. Products use their database IDs.

## Common troubleshooting

| Symptom | Meaning / check |
| --- | --- |
| Invalid login redirect | The actual frontend origin plus `/` must be saved in Keycloak's valid redirect URIs. Port 5174 is different from 5173. |
| Invalid logout redirect | Save the same root URL in valid post logout redirect URIs. |
| User not found in database | `/me` can succeed from token data even when the matching local account is absent. The token username must match the database username. Create accounts through signup/admin creation; the backend now normalizes new usernames to lowercase. |
| User not linked to a tenant | A seller needs a local tenant ID. A Keycloak role alone does not supply that link. |
| Cart disappears after refresh | Cart state is in memory; it is not saved to local storage or a server. |
| Not enough stock | The backend makes the final decision. Current order code also rejects buying exactly the remaining quantity. |

## Suggested revision order

Read shared startup and API files, then Products, Signup, Cart, My orders, My products, and finally the three Admin guides. For each page, explain what loads on mount, what each button changes, what is sent to the API, and what happens on failure.
