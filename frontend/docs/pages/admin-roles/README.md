# Admin roles page

Source: [Admin.jsx](../../../src/pages/Admin.jsx). Route: `/admin/roles`. Access: `admin`. App passes `kind="roles"`.

This page lists local database roles and creates a new one. There are no edit or delete actions because the corresponding API operations are not provided.

## Component reuse

The same `Admin` component renders all three admin pages. Here `kind` selects `/roles`, the Name input, and the ID/Name table headings. The branch `kind !== 'roles'` is false, so neither row deletion actions nor their Action heading are shown. Although the shared component renders `ConfirmDelete`, no role button sets its target, so the dialog remains closed.

## State and request flow

`rows` holds the role list, `form.name` holds the controlled name input, `loading` tracks initial load, and `busy` tracks creation and reloading. `error` and `success` are passed to `Status`. Other fields declared in the shared component are used by its other variants.

1. The effect calls `load()` on mount; protected `GET /roles` returns an array like `[{"id": 1, "name": "user"}]`.
2. `rows.map` renders each ID and name, using the role ID as the row key.
3. Submitting the required Name field calls `create(e)` and prevents the browser's normal form reload.
4. It trims the name and sends protected `POST /roles`:

```json
{"name": "support"}
```

5. Success resets the form, displays a message, and reloads the list. A duplicate role name is returned as an error. An empty successful result displays “No roles found.”

## Local roles versus Keycloak realm roles

The page creates a database role only. A matching realm role must also exist in Keycloak before the backend can create a user assigned to it. The blue informational alert explains this requirement.

Existing application navigation recognizes `admin`, `tenant`, and `user`. Creating a role such as `support` does not automatically add a new protected page or permissions for it. App navigation uses token realm roles; the backend independently checks the roles required by each endpoint.

## Revision checks

- Why does creating a database role not create a Keycloak role?
- Which condition hides the delete column?
- Where would navigation permission for a new role be defined?

Return to the [revision guide](../../README.md).
