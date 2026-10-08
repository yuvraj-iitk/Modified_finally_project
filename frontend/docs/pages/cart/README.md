# Cart page

Source: [Cart.jsx](../../../src/pages/Cart.jsx). Route: `/cart`. Everyone can view it; customers (`user`) and sellers (`tenant`) can place orders.

The cart is shared React state from [CartContext.jsx](../../../src/context/CartContext.jsx), rather than a backend cart. This page receives `items`, `change`, `remove`, and `clear`, plus `user` and `login` from authentication context.

## Cart data and totals

Each item copies a product and adds `amount`, the number the customer wants. `quantity` means the stock captured when the product was added. Example:

```json
{"id": 2, "name": "T Shirt", "price": 1500, "quantity": 21, "amount": 2}
```

The line subtotal is `price * amount`. `reduce` sums all subtotals. Quantity changes call `change(id, value)`, which converts the value and clamps it between 1 and the saved stock. Remove filters the item out. The cart uses no local storage and disappears on a full reload; App also clears it when Logout is clicked.

## Checkout flow

1. With an empty cart, the page displays an empty message and no checkout button.
2. A guest sees Login to place order. An authenticated account with a `user` or `tenant` role sees Place order. Other accounts see an explanatory message.
3. `checkout()` starts loading, clears old messages, and sends protected `POST /orders/me`.
4. `items.map` converts cart data into the API's smaller item objects:

```json
{"items": [{"product_id": 2, "quantity": 2}]}
```

5. No user ID or price is sent. The backend identifies the buyer from the token and calculates prices and stock changes.
6. Success clears the cart and displays the returned order ID and total, with a link to My orders.
7. Failure displays the API error and preserves the cart. `finally` ends loading.

Quantity controls, remove buttons, and Place order are disabled during checkout.

## Things to remember

Displayed stock/prices can become stale. The backend remains authoritative. Current backend code rejects quantities equal to stock as well as quantities above stock. The page exposes that error; it does not implement payment or shipping. Quantity controls do not independently enforce integer values, so the API validates the payload too.

## Revision checks

- Why does the request send `quantity: i.amount` instead of `i.quantity`?
- Why is `clear()` called only after a successful order?
- Where does the backend obtain the buyer's identity?

Read next: [My orders](../my-orders/README.md), or return to the [revision guide](../../README.md).
