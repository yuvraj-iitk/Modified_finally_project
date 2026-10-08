# My orders page

Source: [MyOrders.jsx](../../../src/pages/MyOrders.jsx). Route: `/orders`. App allows logged-in `user` or `tenant` accounts.

This page loads the current account's order history. It does not ask the customer to enter a user ID.

## State and loading

`orders` starts as an empty array, `loading` starts true, and `error` starts empty. On mount, `useEffect` calls protected `GET /orders/me`. The empty dependency array means it loads when this component mounts rather than after every render.

The API helper refreshes the token if needed and attaches it. The backend reads the token username, finds the local user, and selects that user's orders. The `.then` handler saves the array; `.catch` saves an error; `.finally` stops loading.

The `active` flag becomes false in effect cleanup, so a response arriving after the page has unmounted does not update its state. This ignores the result rather than aborting the request.

Illustrative response:

```json
[
  {
    "id": 10,
    "user_id": 23,
    "total_quantity": 2,
    "total_amount": 3000,
    "items": [{"product_id": 2, "quantity": 2}]
  }
]
```

## How the UI chooses a result

`Status` displays loading or error feedback. After a successful load, a non-empty array produces a `DataTable`. An empty array produces “You have no orders yet.” An error is never presented as an empty history.

The outer `map` makes order rows with `o.id` as the key. The inner `map` lists each product ID and quantity. Names and dates are absent from the API response, so they are not displayed. There is no history pagination or automatic periodic refresh; leaving and returning remounts the page.

## Why login can work while history fails

`GET /me` returns information from the token. `GET /orders/me` additionally requires a matching local database account. A missing account or capitalization mismatch therefore causes “User not found in database.” No `/users/me` endpoint is needed for this page.

## Revision checks

- What is the difference between an empty result and a failed request?
- What does the frontend route check, and what does the backend check?
- Why does this page use two nested `map` calls?

Return to the [revision guide](../../README.md).
