import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import App from "./App";
import "./styles.css";
const theme = createTheme({
  palette: { primary: { main: "#1976d2" }, background: { default: "#fafafa" } },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none" } },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>,
);
