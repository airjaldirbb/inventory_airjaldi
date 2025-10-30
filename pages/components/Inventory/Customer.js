import React from 'react'
import { useState, useEffect } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import MuiAlert from "@mui/material/Alert";
import { Box, Typography, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Switch, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Customer() {
  const [rows, setRows] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formState, setFormState] = useState({});
  const [confirmMode, setConfirmMode] = useState(null); // "save" | "cancel" | null
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
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
  //  const handleSaveAdd = () => {
  //   if (!newRowData.custName || !newRowData.phone) {
  //     setSnackbar({
  //       open: true,
  //       message: "Customer name and phone are required!",
  //       severity: "error",
  //     });
  //     return;
  //   }

  //   const newCustomer = {
  //     _id: Date.now().toString(),
  //     custName: newRowData.custName,
  //     code: newRowData.code || "CUST" + (rows.length + 1),
  //     phone: newRowData.phone,
  //     email: newRowData.email || "N/A",
  //     city: newRowData.city || "N/A",
  //     location: newRowData.location || "N/A",
  //     gst: newRowData.gst || "N/A",
  //     gstn: newRowData.gstn || "N/A",
  //     createdOn: new Date().toISOString().split("T")[0],
  //     user: newRowData.user,
  //     ledger: newRowData.ledger,
  //     os: "0",
  //     ageing: "0 days",
  //   };

  //   setRows((prev) => [...prev, newCustomer]);
  //   setAddOpen(false);
  //   setSnackbar({
  //     open: true,
  //     message: "New customer added successfully!",
  //     severity: "success",
  //   });

  //   // reset form
  //   setNewRowData({
  //     custName: "",
  //     code: "",
  //     phone: "",
  //     email: "",
  //     city: "",
  //     location: "",
  //     gst: "",
  //     gstn: "",
  //     user: "Tester",
  //     ledger: "General Ledger",
  //     serialTrackingEnabled: false,
  //   });
  // };


  const columns = [
    {
      field: "edit",
      headerName: "Edit",
      width: 90,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => handleEditRow(params.row)}
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
          variant="outlined"
          color="error"
          onClick={() => handleOpenDeleteConfirm(params.row._id)}
        >
          <DeleteIcon />
        </Button>
      ),
    },
    // { field: "_id", headerName: "ID", width: 200 },
    { field: "custName", headerName: "Name", width: 150 },
    { field: "code", headerName: "Code", width: 150 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "city", headerName: "City", width: 130 },
    { field: "location", headerName: "Location", width: 150 },
    { field: "gst", headerName: "GST", width: 150 },
    { field: "gstn", headerName: "GSTN", width: 150 },
    { field: "createdOn", headerName: "Created On", width: 100 },
    { field: "user", headerName: "User", width: 150 },
    { field: "ledger", headerName: "Ledger", width: 150 },
    { field: "os", headerName: "OS", width: 10 },
    { field: "ageing", headerName: "Ageing", width: 150 },

  ];




  // ✅ Edit user
  const handleEditRow = (row) => {
    setEditRow(row);
    setFormState(row);
  };

  // ✅ Confirm save or cancel
  const handleConfirm = async () => {
    if (confirmMode === "save") {
      try {
        const res = await axios.put("/api/users", formState);
        setRows((prev) =>
          prev.map((row) => (row._id === res.data._id ? res.data : row))
        );
      } catch (error) {
        console.error("Save failed:", error);
      }
    }
    setEditRow(null);
    setConfirmMode(null);
  };
  // 🟡 Open delete confirmation dialog
  const handleOpenDeleteConfirm = (_id) => {
    setDeleteConfirm({ open: true, _id });
  };



  // ✅ Cancel confirmation popup
  const handleCancelConfirm = () => setConfirmMode(null);




  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("/api/customer");
        setRows(response.data);  // Update the state with fetched data
        console.log("response", response.data)
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleSaveAdd = async () => {
    try {
      // Log the data that is being sent to the backend
      console.log("Sending customer data:", newRowData);

      const response = await axios.post("/api/customer", newRowData, {
        headers: {
          "Content-Type": "application/json",  // Explicitly set content type
        },
      });

      // Check the response from the backend
      console.log("Customer created:", response.data);

      // Add the new customer to the rows state
      setRows([...rows, response.data]);

      // Close the dialog and reset the form fields
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
        serialTrackingEnabled: false,
      });
    } catch (error) {
      // Log the error and show any messages in the console
      console.error("Error saving customer:", error.response ? error.response.data : error.message);
    }
  };


  return (
    <>

      <Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {/* ➕ Add Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAddOpen(true)}
            style={{ marginBottom: 10 }}
          >
            ➕ Add Customer
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => setRows([])}
            disabled={rows.length === 0}
          >
            Delete All
          </Button>
        </Stack>
      </Box>


      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={5}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body1" fontWeight="500">
                  No records to display
                </Typography>
              </Box>
            ),
          }}
        />


      </Box>

      {/* ➕ Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Customer Name"
            fullWidth
            required
            value={newRowData.custName}
            onChange={(e) => setNewRowData({ ...newRowData, custName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Customer Code"
            fullWidth
            value={newRowData.code}
            onChange={(e) => setNewRowData({ ...newRowData, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            required
            value={newRowData.phone}
            onChange={(e) => setNewRowData({ ...newRowData, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={newRowData.email}
            onChange={(e) => setNewRowData({ ...newRowData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="City"
            fullWidth
            value={newRowData.city}
            onChange={(e) => setNewRowData({ ...newRowData, city: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={newRowData.location}
            onChange={(e) => setNewRowData({ ...newRowData, location: e.target.value })}
          />
          <TextField
            margin="dense"
            label="GST"
            fullWidth
            value={newRowData.gst}
            onChange={(e) => setNewRowData({ ...newRowData, gst: e.target.value })}
          />
          <TextField
            margin="dense"
            label="GSTN"
            fullWidth
            value={newRowData.gstn}
            onChange={(e) => setNewRowData({ ...newRowData, gstn: e.target.value })}
          />

          <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
            <span style={{ marginRight: "10px" }}>Enable Serial Tracking:</span>
            <Switch
              checked={newRowData.serialTrackingEnabled}
              onChange={(e) =>
                setNewRowData({
                  ...newRowData,
                  serialTrackingEnabled: e.target.checked,
                })
              }
              color="primary"
            />
            <span>{newRowData.serialTrackingEnabled ? "ON" : "OFF"}</span>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAdd} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* ✏️ Edit / Confirm Dialog */}
      <Dialog open={!!editRow} onClose={() => setEditRow(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {confirmMode
            ? confirmMode === "save"
              ? "Confirm Save"
              : "Discard Changes?"
            : "Edit Item"}
        </DialogTitle>

        <DialogContent>
          {confirmMode ? (
            <Typography>
              {confirmMode === "save"
                ? "Are you sure you want to save these changes?"
                : "Are you sure you want to discard your changes? This action cannot be undone."}
            </Typography>
          ) : (
            <>
              <TextField
                margin="dense"
                label="Item Name"
                fullWidth
                value={formState.custName || ""}
                onChange={(e) =>
                  setFormState({ ...formState, custName: e.target.value })
                }
              />

              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.code || ""}
                onChange={(e) =>
                  setFormState({ ...formState, code: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.phone || ""}
                onChange={(e) =>
                  setFormState({ ...formState, phone: e.target.value })
                }
              />

              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.email || ""}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.city || ""}
                onChange={(e) =>
                  setFormState({ ...formState, city: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.location || ""}
                onChange={(e) =>
                  setFormState({ ...formState, location: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.gst || ""}
                onChange={(e) =>
                  setFormState({ ...formState, gst: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.gstn || ""}
                onChange={(e) =>
                  setFormState({ ...formState, gstn: e.target.value })
                }
              />

            </>
          )}
        </DialogContent>

        <DialogActions>
          {confirmMode ? (
            <>
              <Button onClick={handleCancelConfirm} color="secondary">
                No
              </Button>
              <Button
                onClick={handleConfirm}
                color={confirmMode === "save" ? "primary" : "error"}
                variant="contained"
              >
                {confirmMode === "save" ? "Yes, Save" : "Yes, Discard"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setConfirmMode("cancel")} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={() => setConfirmMode("save")}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 🗑️ Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, _id: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography >
            Are you sure you want to delete this record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ open: false, _id: null })}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                await axios.delete("/api/users", { data: { _id: deleteConfirm._id } });

                setRows((prev) =>
                  prev.filter((row) => row._id !== deleteConfirm._id)
                );

                setSnackbar({
                  open: true,
                  message: "User deleted successfully!",
                  severity: "error", // 🔴 red snackbar for delete
                });
              } catch (error) {
                console.error("Delete failed:", error);
                setSnackbar({
                  open: true,
                  message: "Failed to delete user.",
                  severity: "error",
                });
              } finally {
                setDeleteConfirm({ open: false, _id: null });
              }
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>


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
          sx={{
            width: "100%",
            backgroundColor:
              snackbar.severity === "error"
                ? "#d32f2f" // 🔴 custom red for delete
                : snackbar.severity === "success"
                  ? "#2e7d32" // 🟢 green for add/edit
                  : undefined,
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  )
}
