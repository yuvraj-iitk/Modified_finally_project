import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Alert,
} from "@mui/material";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { Status } from "./components/Common";
import Products from "./pages/Products";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import SellerProducts from "./pages/SellerProducts";
import Admin from "./pages/Admin";
function ProtectedRoute({ roles, children }) {
  const { user, loading, login } = useAuth();
  if (loading) return <Status loading />;
  if (!user)
    return (
      <>
        <Alert severity="info">Please log in to view this page.</Alert>
        <Button onClick={login} sx={{ mt: 2 }} variant="contained">
          Login
        </Button>
      </>
    );
  if (roles && !roles.some((role) => user.roles.includes(role)))
    return (
      <Alert severity="warning">
        You do not have permission to view this page.
      </Alert>
    );
  return children;
}
export default function App() {
  const { user, loading, error, login, logout } = useAuth();
  const { items, clear } = useCart();
  const has = (role) => user?.roles.includes(role);
  return (
    <>
      <AppBar position="static">
        <Toolbar className="navbar">
          <Typography variant="h6" sx={{ mr: 2 }}>
            Simple Shop
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Products
          </Button>
          <Button color="inherit" component={Link} to="/cart">
            Cart ({items.reduce((sum, item) => sum + item.amount, 0)})
          </Button>
          {(has("user") || has("tenant")) && (
            <Button color="inherit" component={Link} to="/orders">
              My orders
            </Button>
          )}
          {has("tenant") && (
            <Button color="inherit" component={Link} to="/seller">
              My products
            </Button>
          )}
          {has("admin") &&
            ["tenants", "users", "roles"].map((name) => (
              <Button
                key={name}
                color="inherit"
                component={Link}
                to={`/admin/${name}`}
              >
                {name[0].toUpperCase() + name.slice(1)}
              </Button>
            ))}
          <span style={{ flexGrow: 1 }} />
          {user ? (
            <>
              <Typography variant="body2">{user.username}</Typography>
              <Button
                color="inherit"
                onClick={() => {
                  clear();
                  logout();
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/signup">
                Signup
              </Button>
              <Button color="inherit" disabled={loading} onClick={login}>
                Login
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className="page">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={["user", "tenant"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute roles={["tenant"]}>
                <SellerProducts />
              </ProtectedRoute>
            }
          />
          {["tenants", "users", "roles"].map((kind) => (
            <Route
              key={kind}
              path={`/admin/${kind}`}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Admin key={kind} kind={kind} />
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
}
