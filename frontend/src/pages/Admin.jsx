import { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  TableRow,
  TableCell,
  MenuItem,
  Alert,
} from "@mui/material";
import { api } from "../api";
import { DataTable, Status, ConfirmDelete } from "../components/Common";
const blank = {
  name: "",
  username: "",
  password: "",
  role_id: "",
  tenant_id: "",
};
export default function Admin({ kind }) {
  const [rows, setRows] = useState([]),
    [roles, setRoles] = useState([]),
    [tenants, setTenants] = useState([]),
    [form, setForm] = useState(blank),
    [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  async function load() {
    setRows(await api(`/${kind}`));
    if (kind === "users") {
      const [r, t] = await Promise.all([api("/roles"), api("/tenants")]);
      setRoles(r);
      setTenants(t);
    }
  }
  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [kind]);
  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const body =
      kind === "users"
        ? {
            username: form.username.trim(),
            password: form.password,
            role_id: Number(form.role_id),
            tenant_id: form.tenant_id === "" ? null : Number(form.tenant_id),
          }
        : { name: form.name.trim() };
    try {
      await api(`/${kind}`, { method: "POST", body });
      setForm(blank);
      setSuccess("Created successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/${kind}/${target.id}`, { method: "DELETE" });
      setTarget(null);
      setSuccess("Deleted successfully.");
      await load();
    } catch (err) {
      setTarget(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const roleName = (id) => roles.find((r) => r.id === id)?.name || id;
  const tenantName = (id) =>
    tenants.find((t) => t.id === id)?.name || id || "None";
  const field = (name, label, type = "text") => (
    <TextField
      required
      label={label}
      type={type}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
    />
  );
  return (
    <>
      <Typography variant="h5">Manage {kind}</Typography>
      <Typography sx={{ mt: 2, mb: 2 }}>
        Create{" "}
        {kind === "users" ? "user" : kind === "tenants" ? "tenant" : "role"}
      </Typography>
      <form className="form" onSubmit={create}>
        {kind === "users" ? (
          <>
            {field("username", "Username")}
            {field("password", "Password", "password")}
            <TextField
              select
              required
              label="Role"
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              required={roleName(Number(form.role_id)) === "tenant"}
              label="Tenant"
              value={form.tenant_id}
              onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {tenants.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </>
        ) : (
          field("name", "Name")
        )}
        <Button
          variant="contained"
          type="submit"
          disabled={
            busy ||
            loading ||
            !(kind === "users" ? form.username.trim() : form.name.trim())
          }
        >
          Create
        </Button>
      </form>
      {kind === "roles" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Create a matching realm role in Keycloak before assigning a new role
          to users.
        </Alert>
      )}
      <Status loading={loading || busy} error={error} success={success} />
      {!loading &&
        (rows.length ? (
          <DataTable
            headings={
              kind === "users"
                ? ["ID", "Username", "Role", "Tenant", "Action"]
                : kind === "tenants"
                  ? ["ID", "Name", "Action"]
                  : ["ID", "Name"]
            }
          >
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.username || row.name}</TableCell>
                {kind === "users" && (
                  <>
                    <TableCell>{roleName(row.role_id)}</TableCell>
                    <TableCell>{tenantName(row.tenant_id)}</TableCell>
                  </>
                )}
                {kind !== "roles" && (
                  <TableCell>
                    <Button
                      color="error"
                      disabled={
                        busy ||
                        (kind === "users" && roleName(row.role_id) === "admin")
                      }
                      onClick={() =>
                        setTarget({ ...row, tenantWarning: kind === "tenants" })
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </DataTable>
        ) : (
          !error && <Alert severity="info">No {kind} found.</Alert>
        ))}
      <ConfirmDelete
        target={target}
        onClose={() => setTarget(null)}
        busy={busy}
        onConfirm={remove}
      />
    </>
  );
}
