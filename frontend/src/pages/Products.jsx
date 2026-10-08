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
import { useCart } from "../context/CartContext";
import { DataTable, Status } from "../components/Common";
export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    brand: "",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { add } = useCart();
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page, limit: 10 });
    if (filters.search) query.set("search", filters.search);
    if (filters.category) query.set("category", filters.category);
    const path = filters.brand
      ? `/${encodeURIComponent(filters.brand)}/products`
      : "/products";
    api(`${path}?${query}`, { protectedRequest: false })
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setProducts([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, page]);
  return (
    <>
      <Typography variant="h5">Products</Typography>
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setFilters({
            search: search.trim(),
            category: category.trim(),
            brand: brand.trim(),
          });
        }}
      >
        <TextField
          size="small"
          label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          size="small"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <TextField
          size="small"
          label="Brand name (optional)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Search
        </Button>
        <Button
          onClick={() => {
            setSearch("");
            setCategory("");
            setBrand("");
            setFilters({});
            setPage(1);
          }}
        >
          Reset
        </Button>
      </form>
      <Status loading={loading} error={error} success={success} />
      {!loading &&
        !error &&
        (products.length ? (
          <DataTable
            headings={["Name", "Category", "Price", "Stock", "Action"]}
          >
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.price}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell>
                  <Button
                    disabled={p.quantity <= 0}
                    onClick={() => {
                      add(p);
                      setSuccess(
                        `${p.name} added to cart (up to available stock).`,
                      );
                    }}
                  >
                    {p.quantity > 0 ? "Add to cart" : "Out of stock"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        ) : (
          <Alert severity="info">No products found.</Alert>
        ))}
      <div className="toolbar">
        <Button
          disabled={loading || page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Typography>Page {page}</Typography>
        <Button
          disabled={loading || Boolean(error) || products.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </>
  );
}
