import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import MuiAlert from "@mui/material/Alert";
import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField, Snackbar, Alert,
  Typography, MenuItem,Switch
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
export default function ItemMaster() {
  const [rows, setRows] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formState, setFormState] = useState({});
  const [confirmMode, setConfirmMode] = useState(null); 
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  // Snackbar feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", 
  });

  const [newRowData, setNewRowData] = useState({
    itemName: "",
    itemCode: "",
    underGroup: "",
    stockUnit: "",
    gstClassification: "",
    openingStock: "",
  });


  // ✅ Fetch all users on load
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get("/api/users");
        setRows(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    }
    fetchUsers();
  }, []);

  // ✅ Add new user
  // const handleSaveAdd = async () => {
  //   try {
  //     const res = await axios.post("/api/users", {
  //       firstName: newRowData.firstName,
  //       lastName: newRowData.lastName,
  //       age: Number(newRowData.age),
  //     });

  //     setRows((prev) => [...prev, res.data]);

  //     // ✅ Clear the form after successful save
  //     setNewRowData({ firstName: "", lastName: "", age: "" });

  //     // ✅ Close the dialog
  //     setAddOpen(false);

  //     // ✅ Optional: show snackbar feedback
  //     setSnackbar({
  //       open: true,
  //       message: "User added successfully!",
  //       severity: "success",
  //     });

  //   } catch (error) {
  //     console.error("Error adding user:", error);
  //     setSnackbar({
  //       open: true,
  //       message: "Failed to add user.",
  //       severity: "error",
  //     });
  //   }
  // };

  const handleSaveAdd = async () => {
    try {
      const res = await axios.post("/api/item", {
        itemName: newRowData.itemName,
        itemCode: newRowData.itemCode,
        underGroup: newRowData.underGroup,
        stockUnit: newRowData.stockUnit,
        gstClassification: newRowData.gstClassification,
        openingStock: newRowData.openingStock,
      });

      setRows((prev) => [...prev, res.data]);
    
      setNewRowData({
        itemName: "",
        itemCode: "",
        underGroup: "",
        stockUnit: "",
        gstClassification: "",
        openingStock: "",
      });

      setAddOpen(false);


      setSnackbar({
        open: true,
        message: "Item added successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding item:", error);
      setSnackbar({
        open: true,
        message: "Failed to add item.",
        severity: "error",
      });
    }
  };

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

  // ✅ DataGrid columns
  // const columns = [
  //   {
  //     field: "edit",
  //     headerName: "Edit",
  //     width: 90,
  //     renderCell: (params) => (
  //       <Button
  //         variant="outlined"
  //         color="primary"
  //         size="small"
  //         onClick={() => handleEditRow(params.row)}
  //       >
  //         <EditIcon />
  //       </Button>
  //     ),
  //   },
  //   {
  //     field: "delete",
  //     headerName: "Delete",
  //     width: 90,
  //     renderCell: (params) => (
  //       <Button
  //         variant="outlined"
  //         color="error"
  //         onClick={() => handleOpenDeleteConfirm(params.row._id)} // ✅ open confirm dialog
  //       >
  //         <DeleteIcon />
  //       </Button>
  //     ),
  //   },


  //   { field: "_id", headerName: "ID", width: 200 },
  //   { field: "firstName", headerName: "First Name", width: 150 },
  //   { field: "lastName", headerName: "Last Name", width: 150 },
  //   { field: "age", headerName: "Age", type: "number", width: 110 },
  // ];
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
    { field: "_id", headerName: "ID", width: 200 },
    { field: "itemName", headerName: "Item Name", width: 150 },
    { field: "itemCode", headerName: "Item Code", width: 150 },
    { field: "underGroup", headerName: "Under Group", width: 150 },
    { field: "stockUnit", headerName: "Stock Unit", width: 150 },
    { field: "gstClassification", headerName: "GST Classification", width: 180 },
    { field: "openingStock", headerName: "Opening Stock", width: 150 },
  ];


  return (
    <>
      {/* Toolbar */}
      <Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => setAddOpen(true)}>
            Add Row
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

      {/* DataGrid */}
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
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Item Name"
            fullWidth
            value={newRowData.itemName}
            onChange={(e) => setNewRowData({ ...newRowData, itemName: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Item Code"
            fullWidth
            value={newRowData.itemCode}
            onChange={(e) => setNewRowData({ ...newRowData, itemCode: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Under Group"
            fullWidth
            select
            value={newRowData.underGroup}
            onChange={(e) => setNewRowData({ ...newRowData, underGroup: e.target.value })}
          >
            {["Consumption", "Fiber Equipment", "Wireless CPE", "Assets"].map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Stock Unit"
            fullWidth
            select
            value={newRowData.stockUnit}
            onChange={(e) => setNewRowData({ ...newRowData, stockUnit: e.target.value })}
          >
            {["Kg", "Litre", "Piece", "Box"].map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="GST Classification"
            fullWidth
            select
            value={newRowData.gstClassification}
            onChange={(e) =>
              setNewRowData({ ...newRowData, gstClassification: e.target.value })
            }
          >
            {["5%", "12%", "18%", "28%"].map((gst) => (
              <MenuItem key={gst} value={gst}>
                {gst}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Opening Stock"
            fullWidth
            value={newRowData.openingStock}
            onChange={(e) => setNewRowData({ ...newRowData, openingStock: e.target.value })}
          />

          {/* 🔹 Add Serial Tracking Fields Here */}
          <TextField
            margin="dense"
            label="Serial Tracking"
            fullWidth
            value={newRowData.serialTracking || ""}
            onChange={(e) =>
              setNewRowData({ ...newRowData, serialTracking: e.target.value })
            }
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <span style={{ marginRight: "10px" }}>Enable Serial Tracking:</span>
            <Switch
              checked={newRowData.serialTrackingEnabled || false}
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
                value={formState.itemName || ""}
                onChange={(e) =>
                  setFormState({ ...formState, itemName: e.target.value })
                }
              />

              <TextField
                margin="dense"
                label="Item Code"
                fullWidth
                value={formState.itemCode || ""}
                onChange={(e) =>
                  setFormState({ ...formState, itemCode: e.target.value })
                }
              />

              <TextField
                margin="dense"
                label="Under Group"
                fullWidth
                select
                value={formState.underGroup || ""}
                onChange={(e) =>
                  setFormState({ ...formState, underGroup: e.target.value })
                }
              >
                {["Kg", "Litre", "Piece", "Box"].map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                label="Stock Unit"
                fullWidth
                select
                value={formState.stockUnit || ""}
                onChange={(e) =>
                  setFormState({ ...formState, stockUnit: e.target.value })
                }
              >
                {["Kg", "Litre", "Piece", "Box"].map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                label="GST Classification"
                fullWidth
                select
                value={formState.gstClassification || ""}
                onChange={(e) =>
                  setFormState({ ...formState, gstClassification: e.target.value })
                }
              >
                {["5%", "12%", "18%", "28%"].map((gst) => (
                  <MenuItem key={gst} value={gst}>
                    {gst}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                margin="dense"
                label="Opening Stock"
                fullWidth
                value={formState.openingStock || ""}
                onChange={(e) =>
                  setFormState({ ...formState, openingStock: e.target.value })
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
  );
}
