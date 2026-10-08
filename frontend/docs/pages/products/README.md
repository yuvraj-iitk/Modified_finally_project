# Products page

Source: [Products.jsx](../../../src/pages/Products.jsx). Route: `/`. Access: everyone.

This page displays a table of products, searches by name, filters by exact category and optional brand name, and adds products to the shared cart.

## State to understand

| State | Purpose |
| --- | --- |
| `products` | The current page of API results. |
| `search`, `category`, `brand` | What the user is currently typing. |
| `filters` | The last submitted search values. Separate from input state so typing alone does not fetch data. |
| `page` | Current page number, starting at 1. |
| `loading`, `error`, `success` | Messages and loading state displayed by `Status`. |

## How it works

1. On mount, `useEffect` builds a query with `page` and `limit=10`.
2. Non-empty submitted search/category values are added using `URLSearchParams`.
3. Without a brand, it requests `GET /products`. With a brand, it requests `GET /{tenant_name}/products`; `encodeURIComponent` makes the brand safe for a URL path.
4. The call is public: `protectedRequest: false`. The returned array becomes `products`.
5. Submitting Search trims the inputs, resets page to 1, and replaces `filters`. The effect runs again because its dependencies are `[filters, page]`.
6. Reset clears the inputs and filters and returns to page 1.
7. Add to cart calls `add(p)` from `CartContext` and sets a success message. It does not send an API request or create an order. Stock of zero disables that button.

Example request: `GET /products?page=1&limit=10&search=shirt&category=Clothing`.

Example result item:

```json
{"id": 2, "name": "T Shirt", "category": "Clothing", "price": 1500, "quantity": 21, "tenant_id": 6}
```

## Rendering and pagination

`products.map` produces one row per product, with `p.id` as its key. The page hides the table while loading or showing an error; an empty successful result displays “No products found.” Previous is disabled on page 1. Next is disabled when fewer than 10 products return, on errors, or during loading. There is no API total count: a full final page can still lead to an empty next page.

The effect cleanup sets `active=false`. It ignores an old response after navigation or a newer request; it does not cancel the HTTP request itself.

## Revision checks

- Why are typed input values separate from `filters`?
- Why does changing `page` reload results?
- Why does adding a product leave backend stock unchanged?

Read next: [Cart](../cart/README.md), or return to the [revision guide](../../README.md).
