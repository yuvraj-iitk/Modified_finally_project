import { useEffect, useState } from "react";
import { Typography, TableRow, TableCell, Alert } from "@mui/material";
import { api } from "../api";
import { DataTable, Status } from "../components/Common";
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("/orders/me")
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <Typography variant="h5">My orders</Typography>
      <Status loading={loading} error={error} />
      {!loading &&
        !error &&
        (orders.length ? (
          <DataTable
            headings={["Order ID", "Total quantity", "Total amount", "Items"]}
          >
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.id}</TableCell>
                <TableCell>{o.total_quantity}</TableCell>
                <TableCell>{o.total_amount}</TableCell>
                <TableCell>
                  {o.items.map((i, index) => (
                    <div key={index}>
                      Product #{i.product_id}: {i.quantity}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        ) : (
          <Alert severity="info">You have no orders yet.</Alert>
        ))}
    </>
  );
}
