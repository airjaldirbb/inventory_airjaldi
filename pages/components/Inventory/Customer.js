
"use client"
import React, { useState, useEffect } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

export default function Customer() {
  const [rows, setRows] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formState, setFormState] = useState({});
  const [confirmMode, setConfirmMode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, _id: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newRowData, setNewRowData] = useState({
    custName: "",
    code: "",
    phone: "",
    email: "",
    city: "",
    location: "",
    gst: "",
    gstn: "",
    user: "Tester",
    ledger: "General Ledger",
    serialTrackingEnabled: false,
  });

  // ✅ Fetch all customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("/api/customer");
        setRows(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // ✅ Add Customer
  const handleSaveAdd = async () => {
    try {
      if (!newRowData.custName || !newRowData.phone) {
        setSnackbar({
          open: true,
          message: "Customer name and phone are required!",
          severity: "error",
        });
        return;
      }

      const response = await axios.post("/api/customer", newRowData, {
        headers: { "Content-Type": "application/json" },
      });

      setRows((prev) => [...prev, response.data]);
      setSnackbar({
        open: true,
        message: "Customer added successfully!",
        severity: "success",
      });
      setAddOpen(false);
      setNewRowData({
        custName: "",
        code: "",
        phone: "",
        email: "",
        city: "",
        location: "",
        gst: "",
        gstn: "",
        user: "Tester",
        ledger: "General Ledger",
        serialTrackingEnabled: false,
      });
    } catch (error) {
      console.error("Error adding customer:", error);
      setSnackbar({
        open: true,
        message: "Failed to add customer!",
        severity: "error",
      });
    }
  };

  // ✅ Edit Row
  const handleEditRow = (row) => {
    setEditRow(row);
    setFormState(row);
  };

  // ✅ Confirm Save (PUT request)
const handleConfirm = async () => {
  if (confirmMode === "save" && editRow) {
    try {
      const res = await axios.put(`/api/customer?id=${editRow._id}`, formState);

      const updatedCustomer = res.data;

      setRows((prev) =>
        prev.map((r) => (r._id === updatedCustomer._id ? updatedCustomer : r))
      );

      setSnackbar({
        open: true,
        message: "Customer updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      setSnackbar({
        open: true,
        message: "Error updating customer!",
        severity: "error",
      });
    } finally {
      setEditRow(null);
      setConfirmMode(null);
    }
  }
};


  const handleCancelConfirm = () => setConfirmMode(null);

  // ✅ Delete Customer
  const handleOpenDeleteConfirm = (_id) => {
    setDeleteConfirm({ open: true, _id });
  };

  const handleDeleteCustomer = async () => {
    try {
      
      await axios.delete(`/api/customer?id=${deleteConfirm._id}`);

      setRows((prev) => prev.filter((r) => r._id !== deleteConfirm._id));
      setSnackbar({
        open: true,
        message: "Customer deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete customer!",
        severity: "error",
      });
    } finally {
      setDeleteConfirm({ open: false, _id: null });
    }
  };

  // ✅ Table Columns
  const columns = [
    {
      field: "edit",
      headerName: "Edit",
      width: 80,
      renderCell: (params) => (
        <Button
          color="primary"
          onClick={() => handleEditRow(params.row)}
          size="small"
        >
          <EditIcon />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 90,
      renderCell: (params) => (
        <Button
          color="error"
          onClick={() => handleOpenDeleteConfirm(params.row._id)}
          size="small"
        >
          <DeleteIcon />
        </Button>
      ),
    },
    { field: "custName", headerName: "Name", width: 150 },
    { field: "code", headerName: "Code", width: 120 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "city", headerName: "City", width: 120 },
    { field: "location", headerName: "Location", width: 150 },
    { field: "gst", headerName: "GST", width: 120 },
    { field: "gstn", headerName: "GSTN", width: 150 },
    { field: "user", headerName: "User", width: 120 },
  ];

 const [balance, setBalance] = useState(null);
  const [userId, setUserId] = useState("");

  const fetchBalance = async () => {
    const res = await fetch(`/api/jaze?userId=${userId}`);
    const data = await res.json();
    console.log("Jaze data:", data);
    setBalance(data);
  };

  return (
    <>
      {/* Toolbar */}

       <div>
      <h2>Check User Balance</h2>
      <input
        type="text"
        placeholder="Enter userId"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={fetchBalance}>Get Balance</button>
      {balance && (
        <pre>{JSON.stringify(balance, null, 2)}</pre>
      )}
    </div>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => setAddOpen(true)}>
            ➕ Add Customer
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setRows([])}
            disabled={!rows.length}
          >
            Delete All
          </Button>
        </Stack>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r._id}
          pageSize={10}
          disableRowSelectionOnClick
        />
      </Box>

      {/* ➕ Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          {[
            "custName",
            "code",
            "phone",
            "email",
            "city",
            "location",
            "gst",
            "gstn",
          ].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              fullWidth
              value={newRowData[field]}
              onChange={(e) =>
                setNewRowData({ ...newRowData, [field]: e.target.value })
              }
            />
          ))}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 1 }}>Enable Serial Tracking:</Typography>
            <Switch
              checked={newRowData.serialTrackingEnabled}
              onChange={(e) =>
                setNewRowData({
                  ...newRowData,
                  serialTrackingEnabled: e.target.checked,
                })
              }
            />
            <Typography>
              {newRowData.serialTrackingEnabled ? "ON" : "OFF"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✏️ Edit Dialog */}
      <Dialog open={!!editRow} onClose={() => setEditRow(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {confirmMode
            ? confirmMode === "save"
              ? "Confirm Save"
              : "Discard Changes?"
            : "Edit Customer"}
        </DialogTitle>
        <DialogContent>
          {confirmMode ? (
            <Typography sx={{ mt: 2 }}>
              {confirmMode === "save"
                ? "Are you sure you want to save these changes?"
                : "Discard changes?"}
            </Typography>
          ) : (
            <>
              {["custName", "code", "phone", "email", "city", "location", "gst", "gstn"].map(
                (field) => (
                  <TextField
                    key={field}
                    margin="dense"
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    fullWidth
                    value={formState[field] || ""}
                    onChange={(e) =>
                      setFormState({ ...formState, [field]: e.target.value })
                    }
                  />
                )
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {confirmMode ? (
            <>
              <Button onClick={handleCancelConfirm}>No</Button>
              <Button onClick={handleConfirm} variant="contained">
                Yes
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setConfirmMode("cancel")}>Cancel</Button>
              <Button onClick={() => setConfirmMode("save")} variant="contained">
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 🗑️ Delete Confirmation */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, _id: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this customer?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, _id: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteCustomer} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
