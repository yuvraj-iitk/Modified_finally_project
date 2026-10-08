import { useState } from "react";
import { Typography, TextField, Button } from "@mui/material";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Status } from "../components/Common";
export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api("/signup", {
        method: "POST",
        protectedRequest: false,
        body: { username: username.trim(), password },
      });
      setSuccess("Account created. You can now log in.");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Create an account
      </Typography>
      <form className="form" onSubmit={submit}>
        <TextField
          label="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !username.trim()}
        >
          Signup
        </Button>
      </form>
      <Status loading={loading} error={error} success={success} />
      {success && (
        <Button variant="contained" onClick={login}>
          Login
        </Button>
      )}
    </>
  );
}
