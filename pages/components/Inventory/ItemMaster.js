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
  TextField,
  Snackbar,
  Typography,
  MenuItem,
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
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, _id: null });
  const [editOpen, setEditOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [newRowData, setNewRowData] = useState({
    Name: "",
    Code: "",
    HSN_Code: "Default",
    Category_Name: "",
    Group: "Assets",
    BAR_CODE_TRACKING: "DISABLE",
  });

  const [editData, setEditData] = useState({
    _id: "",
    itemName: "",
    itemCode: "",
    hsnCode: "",
    categoryName: "",
    underGroup: "",
    barcodeTracking: "",
  });


  const [groups, setGroups] = useState([]);
  const [barcodeOptions, setBarcodeOptions] = useState(["DISABLE", "ENABLE"]);

  // 🔹 Fetch items + dropdown enums
  useEffect(() => {
    axios
      .get("/api/item")
      .then((response) => {
        const { data, enums } = response.data;

        if (Array.isArray(data)) setRows(data);

        if (enums) {
          setGroups(enums.underGroup || []);
          setBarcodeOptions(enums.barcodeTracking || ["DISABLE", "ENABLE"]);
        }
      })
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  // 🔹 Add item
  const handleSaveAdd = async () => {
    try {
      // Build payload consistent with backend
      const payload = {
        Name: newRowData.Name.trim(),
        Code: newRowData.Code.trim(),
        HSN_Code: newRowData.HSN_Code.trim() || "Default",
        Category_Name: newRowData.Category_Name.trim(),
        Group: newRowData.Group,
        BAR_CODE_TRACKING: newRowData.BAR_CODE_TRACKING,
      };

      const res = await axios.post("/api/item", payload);

      // Backend returns { message, data: [items] }
      const newItems = Array.isArray(res.data.data) ? res.data.data : [res.data.data];

      setRows((prev) => [...prev, ...newItems]);

      // Reset form
      setNewRowData({
        Name: "",
        Code: "",
        HSN_Code: "Default",
        Category_Name: "",
        Group: "Assets",
        BAR_CODE_TRACKING: "DISABLE",
      });

      setAddOpen(false);
      setSnackbar({ open: true, message: "Item added successfully!", severity: "success" });
    } catch (error) {
      console.error("Error adding item:", error.response?.data || error.message);
      setSnackbar({ open: true, message: "Failed to add item.", severity: "error" });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        _id: editData._id,
        itemName: editData.itemName.trim(),
        itemCode: editData.itemCode.trim(),
        hsnCode: editData.hsnCode.trim() || "Default",
        categoryName: editData.categoryName.trim(),
        underGroup: editData.underGroup,
        barcodeTracking: editData.barcodeTracking,
      };

      const res = await axios.put("/api/item", payload);
      const updatedItem = res.data.data;

      setRows((prev) => prev.map((r) => (r._id === updatedItem._id ? updatedItem : r)));
      setEditOpen(false);
      setSnackbar({ open: true, message: "Item updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating item:", error.response?.data || error.message);
      setSnackbar({ open: true, message: "Failed to update item.", severity: "error" });
    }
  };
  const handleEditRow = (row) => {
    setEditData({
      _id: row._id,
      itemName: row.itemName,
      itemCode: row.itemCode,
      hsnCode: row.hsnCode,
      categoryName: row.categoryName,
      underGroup: row.underGroup,
      barcodeTracking: row.barcodeTracking,
    });
    setEditOpen(true);
  };
  const handleOpenDeleteConfirm = (_id) => setDeleteConfirm({ open: true, _id });

  const handleConfirmDelete = async () => {
    try {
      const res = await axios.delete("/api/item", { data: { _id: deleteConfirm._id } });
      setRows((prev) => prev.filter((r) => r._id !== deleteConfirm._id));
      setSnackbar({ open: true, message: "Item deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting item:", error.response?.data || error.message);
      setSnackbar({ open: true, message: "Failed to delete item.", severity: "error" });
    } finally {
      setDeleteConfirm({ open: false, _id: null });
    }
  };
  // 🔹 Confirm save on edit
  const handleConfirm = async () => {
    if (confirmMode === "save") {
      try {
        const res = await axios.put("/api/item", formState);
        const updatedItem = res.data.data;
        setRows((prev) => prev.map((row) => (row._id === updatedItem._id ? updatedItem : row)));
        setSnackbar({ open: true, message: "Item updated successfully!", severity: "success" });
      } catch (error) {
        console.error("Save failed:", error);
        setSnackbar({ open: true, message: "Failed to update item.", severity: "error" });
      }
    }
    setEditRow(null);
    setConfirmMode(null);
  };


  const columns = [
    {
      field: "edit",
      headerName: "Edit",
      width: 90,
      renderCell: (params) => (
        <Button variant="outlined" color="primary" size="small" onClick={() => handleEditRow(params.row)}>
          <EditIcon />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 90,
      renderCell: (params) => (
        <Button variant="outlined" color="error" onClick={() => handleOpenDeleteConfirm(params.row._id)}>
          <DeleteIcon />
        </Button>
      ),
    },
    { field: "itemName", headerName: "Name", width: 150 },
    { field: "itemCode", headerName: "Code", width: 150 },
    { field: "hsnCode", headerName: "HSN Code", width: 50 },
    { field: "underGroup", headerName: "Group", width: 150 },
    { field: "categoryName", headerName: "Category", width: 150 },
    { field: "barcodeTracking", headerName: "Barcode Tracking", width: 150 },
  ];

  return (
    <>
      {/* Toolbar */}
      <Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => setAddOpen(true)}>
            Add Item
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

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={newRowData.Name}
            onChange={(e) => setNewRowData({ ...newRowData, Name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Code"
            fullWidth
            value={newRowData.Code}
            onChange={(e) => setNewRowData({ ...newRowData, Code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="HSN Code"
            fullWidth
            value={newRowData.HSN_Code}
            onChange={(e) => setNewRowData({ ...newRowData, HSN_Code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category Name"
            fullWidth
            value={newRowData.Category_Name}
            onChange={(e) => setNewRowData({ ...newRowData, Category_Name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Group"
            fullWidth
            select
            value={newRowData.Group}
            onChange={(e) => setNewRowData({ ...newRowData, Group: e.target.value })}
          >
            {groups.map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Barcode Tracking"
            fullWidth
            select
            value={newRowData.BAR_CODE_TRACKING}
            onChange={(e) => setNewRowData({ ...newRowData, BAR_CODE_TRACKING: e.target.value })}
          >
            {barcodeOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAdd}>
            Save
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={editData.itemName}
            onChange={(e) => setEditData({ ...editData, itemName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Code"
            fullWidth
            value={editData.itemCode}
            onChange={(e) => setEditData({ ...editData, itemCode: e.target.value })}
          />
          <TextField
            margin="dense"
            label="HSN Code"
            fullWidth
            value={editData.hsnCode}
            onChange={(e) => setEditData({ ...editData, hsnCode: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category Name"
            fullWidth
            value={editData.categoryName}
            onChange={(e) => setEditData({ ...editData, categoryName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Group"
            fullWidth
            select
            value={editData.underGroup}
            onChange={(e) => setEditData({ ...editData, underGroup: e.target.value })}
          >
            {groups.map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Barcode Tracking"
            fullWidth
            select
            value={editData.barcodeTracking}
            onChange={(e) => setEditData({ ...editData, barcodeTracking: e.target.value })}
          >
            {barcodeOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Delete Confirmation Dialog ===== */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, _id: null })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, _id: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
