import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  TableRow,
  TableCell,
  Alert,
} from "@mui/material";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { DataTable, Status } from "../components/Common";
export default function Cart() {
  const { items, change, remove, clear } = useCart();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canOrder = user?.roles.some((role) =>
    ["user", "tenant"].includes(role),
  );
  async function checkout() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await api("/orders/me", {
        method: "POST",
        body: {
          items: items.map((i) => ({ product_id: i.id, quantity: i.amount })),
        },
      });
      clear();
      setSuccess(
        `Order #${result.order_id} placed. Total: ${result.total_amount}`,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Typography variant="h5">Cart</Typography>
      <Status loading={loading} error={error} success={success} />
      {items.length ? (
        <>
          <DataTable
            headings={["Product", "Price", "Quantity", "Subtotal", "Action"]}
          >
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.name}</TableCell>
                <TableCell>{i.price}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    label={`Quantity for ${i.name}`}
                    value={i.amount}
                    disabled={loading}
                    onChange={(e) => change(i.id, e.target.value)}
                    slotProps={{ htmlInput: { min: 1, max: i.quantity } }}
                    sx={{ width: 150 }}
                  />
                </TableCell>
                <TableCell>{i.price * i.amount}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    disabled={loading}
                    onClick={() => remove(i.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
          <Typography sx={{ my: 3 }}>
            Total: {items.reduce((sum, i) => sum + i.price * i.amount, 0)}
          </Typography>
          {!user ? (
            <Button variant="contained" onClick={login}>
              Login to place order
            </Button>
          ) : canOrder ? (
            <Button variant="contained" disabled={loading} onClick={checkout}>
              Place order
            </Button>
          ) : (
            <Alert severity="info">
              A customer or seller account is required to place orders.
            </Alert>
          )}
        </>
      ) : (
        <Alert severity="info">Your cart is empty.</Alert>
      )}
      <Button component={Link} to="/" sx={{ mt: 2 }}>
        Continue shopping
      </Button>
      {success && (
        <Button component={Link} to="/orders" sx={{ mt: 2 }}>
          View my orders
        </Button>
      )}
    </>
  );
}
