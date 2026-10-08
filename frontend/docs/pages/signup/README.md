# Signup page

Source: [Signup.jsx](../../../src/pages/Signup.jsx). Route: `/signup`. Access: everyone.

This form creates a normal customer account using the backend. Authentication then happens on Keycloak's login page.

## State

`username` and `password` hold the controlled input values. `loading` disables submission while a request runs. `error` and `success` hold feedback messages.

## Submission flow

1. The form calls `submit(e)`. `e.preventDefault()` prevents a browser page reload.
2. Loading starts and previous messages are cleared.
3. The page sends a public `POST /signup` request with a trimmed username and the password. It does not trim or lowercase the password.
4. The backend creates the Keycloak user and its local customer record. The frontend does not call the Keycloak admin API.
5. On success, it clears the password, displays a message, and shows a Login button. It does not log in automatically.
6. Login calls `login()` from `AuthContext` and opens Keycloak.
7. `catch` displays a backend/network error; `finally` ends loading whether the request passed or failed.

Illustrative request body:

```json
{"username": "NewCustomer", "password": "example-only"}
```

The current backend normalizes new usernames to lowercase, so this username is stored as `newcustomer` in both systems. The frontend itself only removes surrounding username whitespace.

## Validation and components

Material UI `TextField` renders each input. `value` and `onChange` make them controlled. `required` uses browser validation; the button also rejects a whitespace-only username. Password policy is determined by Keycloak, rather than custom frontend rules. `autoComplete` hints tell the browser what each field represents. `Status` displays results.

A duplicate username or missing backend customer role produces an error. Creating a user directly in Keycloak skips the local database record that orders require.

## Revision checks

- Why is `protectedRequest: false` needed?
- Which part creates the account, and which part logs it in?
- Why is loading reset in `finally`?

Return to the [revision guide](../../README.md).
