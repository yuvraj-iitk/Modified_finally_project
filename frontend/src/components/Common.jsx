import {
  Alert,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
export function Status({ loading, error, success }) {
  return (
    <Stack spacing={2} sx={{ my: 2 }}>
      {loading && <CircularProgress size={24} aria-label="Loading" />}
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
    </Stack>
  );
}
export function DataTable({ headings, children }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {headings.map((h) => (
              <TableCell key={h}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}
export function ConfirmDelete({ target, onClose, onConfirm, busy }) {
  return (
    <Dialog open={Boolean(target)} onClose={busy ? undefined : onClose}>
      <DialogTitle>Confirm deletion</DialogTitle>
      <DialogContent>
        Delete {target?.name || target?.username}?{" "}
        {target?.tenantWarning &&
          "This also deletes its users, products, and related orders."}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button color="error" disabled={busy} onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
