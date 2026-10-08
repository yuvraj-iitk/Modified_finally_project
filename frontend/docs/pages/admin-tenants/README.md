# Admin tenants page

Source: [Admin.jsx](../../../src/pages/Admin.jsx). Route: `/admin/tenants`. App renders `<Admin kind="tenants" />` inside an admin-only `ProtectedRoute`.

This page lists brands, creates them, and deletes them after confirmation. It has no rename/edit action.

## One component, three pages

`Admin` accepts the `kind` prop. App uses it for tenants, users, and roles. For this route, `kind` is `tenants`, so template strings such as `api('/' + kind)` target `/tenants`. The keyed component in App gives each admin variant its own state when switching pages.

## State and requests

`rows` contains tenants, `form.name` contains the name input, and `target` holds the deletion selection. `loading` tracks initial loading; `busy` tracks writes/reloads; `error` and `success` feed `Status`. The shared component also declares `roles` and `tenants` arrays for the user-management variant; they are not loaded here.

| Event | Protected API call |
| --- | --- |
| Mount | `GET /tenants` |
| Create | `POST /tenants` with `{"name": "Zara"}` |
| Confirm delete | `DELETE /tenants/{id}` |

## Flow through the code

1. The effect depends on `kind` and calls `load()`. The resulting array becomes `rows`.
2. `field('name', 'Name')` creates a controlled, required text input using a helper function.
3. Create calls `create(e)`, prevents the page reload, trims the name, and sends the JSON body.
4. Success resets the form, displays a message, and calls `load()` to show the latest data. A duplicate name produces a backend error.
5. The list uses `rows.map` to render ID, name, and Delete.
6. Clicking Delete sets `{ ...row, tenantWarning: true }` as `target`; the shared dialog explains the associated deletions.
7. Confirmation calls `remove()`, which sends DELETE and reloads the list. Cancel only clears `target`.

Deletion affects tenant users, products, and related orders according to the backend implementation. The confirmation dialog exists because this is more consequential than removing a row from a frontend table.

## UI and error behavior

Create is disabled during loading/busy or for a blank name. Delete is disabled during writes. Initial failure shows an error; a successful empty list shows “No tenants found.” Existing rows may remain visible if a later reload fails. The API enforces the admin role even if someone bypasses frontend navigation.

## Revision checks

- How does `kind` select the endpoints and table headings?
- Why is a confirmation dialog used before DELETE?
- Why does a POST need a reload of the list?

Read [Admin users](../admin-users/README.md), or return to the [revision guide](../../README.md).
