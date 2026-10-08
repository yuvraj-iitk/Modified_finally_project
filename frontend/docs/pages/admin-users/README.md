# Admin users page

Source: [Admin.jsx](../../../src/pages/Admin.jsx). Route: `/admin/users`. Access: `admin`. App passes `kind="users"`.

This page creates tenant/seller accounts, displays existing users with their role and tenant, and deletes eligible users. It does not offer editing of an existing user's tenant, role, or password.

## State and initial load

`rows` stores users. `roles` and `tenants` store lookup lists for the dropdowns and readable table labels. `form` stores username, password, role ID, and tenant ID. `target` stores a pending deletion. Loading, busy, error, and success state control feedback and actions.

`load()` first requests `GET /users` and saves that list. It then requests `GET /roles` and `GET /tenants` together using `Promise.all`. Every request is protected. Role/tenant lookup helpers use `find` to convert an ID to a name; an unknown ID falls back to displaying the ID, and an absent tenant displays “None.”

## Creating a user

1. Enter a username and password. The Role dropdown contains only Tenant and selects its `tenant` role ID by default after roles load. The default is found by role name rather than a hardcoded ID.
2. Choosing the `tenant` role makes the Tenant dropdown required. Choose the seller's brand, such as Zara. A tenant must be selected before creating a seller.
3. Submit calls `create(e)`, trims username, converts role/tenant selections to numeric IDs, and maps an empty tenant selection to `null`.
4. It sends `POST /users` with a body such as:

```json
{"username": "ZaraUser2", "password": "example-only", "role_id": 3, "tenant_id": 6}
```

These IDs are examples. The form uses IDs returned by the API rather than hardcoded IDs.

5. The backend creates the Keycloak account, assigns its realm role, and creates the linked local database record. The frontend never uses admin credentials or calls Keycloak's admin API directly.
6. The backend now normalizes new usernames to lowercase, so `ZaraUser2` becomes `zarauser2` in both systems. The frontend itself only trims the username.
7. Success clears the username, password, and tenant selection, restores the default `tenant` role, and reloads the lists. Failure keeps the form and displays the error. Reloading the lists after deletion preserves a role you already chose.

Creating an account directly in Keycloak skips the local record. That account can log in but still fail when requesting orders or seller products. Both systems must have the same username.

## Deleting a user

The list displays ID, username, readable role, readable tenant, and Delete. Delete is disabled for accounts whose local role resolves to `admin`; the backend also refuses deletion of admin accounts. Other rows open `ConfirmDelete`. Confirmation calls protected `DELETE /users/{id}` and reloads the page. The backend coordinates Keycloak and local deletion; the frontend does not perform those steps separately.

## Revision checks

- Why are role/tenant IDs converted with `Number`?
- Why is None sent as `null` rather than an empty string?
- Why does a seller need both a Keycloak role and a local tenant ID?

Return to the [revision guide](../../README.md).
