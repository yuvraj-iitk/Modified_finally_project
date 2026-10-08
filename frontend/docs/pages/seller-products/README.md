# My products / seller page

Source: [SellerProducts.jsx](../../../src/pages/SellerProducts.jsx). Route: `/seller`. Access: a logged-in account with the `tenant` realm role.

This page manages products for the seller's linked brand. One form handles both creation and editing.

## State

| State | Purpose |
| --- | --- |
| `tenant` | Current seller's tenant ID and name from `/my-tenant`. |
| `products` | Products returned by `/my-products`. |
| `form` | Name, category, price, and quantity fields. |
| `editing` | Product being edited, or null for creation. |
| `target` | Product selected for delete confirmation. |
| `loading` | Initial page load. |
| `busy` | Save, stock update, delete, or their follow-up reload. |
| `error`, `success` | Feedback messages. |

## Initial load

`useEffect` calls `load()` on mount. `load()` starts `GET /my-tenant` and `GET /my-products` together with `Promise.all`. Both calls are protected. The tenant supplies the form's hidden tenant ID; users do not choose another brand. If either request fails, the combined load fails and an error is displayed.

## API actions

| Action | Request | Data |
| --- | --- | --- |
| Create | `POST /products` | Full product body |
| Edit | `PUT /products/{id}` | Full product body |
| Stock only | `PUT /products/{id}/stock?quantity=12` | Quantity in query; no JSON body |
| Delete | `DELETE /products/{id}` | ID in path; no body |

Example full body:

```json
{"name": "Shirt", "category": "Clothing", "price": 1500, "quantity": 12, "tenant_id": 6}
```

`save(e)` prevents a page reload, trims the text fields, converts price/quantity to numbers, and adds `tenant.tenant_id`. Whether `editing` exists determines the method and URL.

## Form and mutation flow

The form's fields are generated with `map`. Editing calls `setForm(p)` and `setEditing(p)`, so the same inputs show the existing product. Changing one input creates a copied form object. Cancel restores the blank form and clears `editing`.

`mutate(action, message)` is a shared wrapper for writes: it starts `busy`, clears messages, awaits the supplied action, clears the form/edit/delete selection, displays success, and reloads the tenant and products. On failure it displays the error and clears the deletion target. `finally` ends `busy`. A successful write followed by a failed reload can display both success and an error, because they describe separate requests.

Delete first sets `target`. `ConfirmDelete` opens because the target exists. Cancel clears it. Confirm invokes `mutate` with the delete request. Stock-only sends just the current quantity and ignores other edited form fields.

## Validation and boundaries

The main form requires all fields and offers nonnegative integer number inputs. Save is disabled without a loaded tenant or meaningful text. The stock-only button is a separate click handler, so form submission validation is not automatically run for it; the backend must validate its quantity. Backend ownership checks enforce the seller's brand restriction.

A Keycloak tenant role alone is insufficient: the matching local account must have a tenant link. “No products yet” means loading succeeded and the returned list is empty.

## Revision checks

- Why is `tenant_id` taken from `/my-tenant`?
- Why does `mutate` reload the list after every write?
- How does `editing` change the form's behavior?

Return to the [revision guide](../../README.md).
