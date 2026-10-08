import { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  TableRow,
  TableCell,
  Alert,
} from "@mui/material";
import { api } from "../api";
import { DataTable, Status, ConfirmDelete } from "../components/Common";
const blank = { name: "", category: "", price: "", quantity: "" };
export default function SellerProducts() {
  const [tenant, setTenant] = useState(null),
    [products, setProducts] = useState([]),
    [form, setForm] = useState(blank),
    [editing, setEditing] = useState(null),
    [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  async function load() {
    const [t, p] = await Promise.all([api("/my-tenant"), api("/my-products")]);
    setTenant(t);
    setProducts(p);
  }
  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  async function mutate(action, message) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
      setForm(blank);
      setEditing(null);
      setTarget(null);
      setSuccess(message);
      await load();
    } catch (err) {
      setError(err.message);
      setTarget(null);
    } finally {
      setBusy(false);
    }
  }
  function save(e) {
    e.preventDefault();
    mutate(
      () =>
        api(editing ? `/products/${editing.id}` : "/products", {
          method: editing ? "PUT" : "POST",
          body: {
            name: form.name.trim(),
            category: form.category.trim(),
            price: Number(form.price),
            quantity: Number(form.quantity),
            tenant_id: tenant.tenant_id,
          },
        }),
      "Product saved.",
    );
  }
  return (
    <>
      <Typography variant="h5">My products</Typography>
      {tenant && (
        <Typography sx={{ mt: 1 }}>Brand: {tenant.tenant_name}</Typography>
      )}
      <Typography sx={{ mt: 3, mb: 2 }}>
        {editing ? `Edit ${editing.name}` : "Add a product"}
      </Typography>
      <form className="form" onSubmit={save}>
        {["name", "category", "price", "quantity"].map((field) => (
          <TextField
            key={field}
            required
            label={field[0].toUpperCase() + field.slice(1)}
            type={["price", "quantity"].includes(field) ? "number" : "text"}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
        ))}
        <div>
          <Button
            type="submit"
            variant="contained"
            disabled={
              busy || !tenant || !form.name.trim() || !form.category.trim()
            }
          >
            Save product
          </Button>
          {editing && (
            <Button
              onClick={() => {
                setForm(blank);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          )}
          {editing && (
            <Button
              disabled={busy || form.quantity === ""}
              onClick={() =>
                mutate(
                  () =>
                    api(
                      `/products/${editing.id}/stock?quantity=${Number(form.quantity)}`,
                      { method: "PUT" },
                    ),
                  "Stock updated.",
                )
              }
            >
              Update stock only
            </Button>
          )}
        </div>
      </form>
      <Status loading={loading || busy} error={error} success={success} />
      {products.length ? (
        <DataTable headings={["Name", "Category", "Price", "Stock", "Actions"]}>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>{p.price}</TableCell>
              <TableCell>{p.quantity}</TableCell>
              <TableCell>
                <Button
                  disabled={busy}
                  onClick={() => {
                    setForm(p);
                    setEditing(p);
                    setError("");
                  }}
                >
                  Edit / stock
                </Button>
                <Button
                  disabled={busy}
                  color="error"
                  onClick={() => setTarget(p)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        !loading && !error && <Alert severity="info">No products yet.</Alert>
      )}
      <ConfirmDelete
        target={target}
        busy={busy}
        onClose={() => setTarget(null)}
        onConfirm={() =>
          mutate(
            () => api(`/products/${target.id}`, { method: "DELETE" }),
            "Product deleted.",
          )
        }
      />
    </>
  );
}
