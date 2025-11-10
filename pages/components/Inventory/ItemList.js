import React, { useEffect, useState } from "react";
import {
  Box, Typography, Snackbar, Button, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

export default function ItemMasterGrid() {
  const [items, setItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    Name: "", Code: "", HSN_Code: "", Category_Name: "",
    Group: "", BAR_CODE_TRACKING: "DISABLE"
  });
  const [editedRows, setEditedRows] = useState({});

  const groups = ["Consumption", "Fiber Equipments", "Wireless CPE", "Assets"];
  const barcodeOptions = ["ENABLE", "DISABLE"];

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/item");
      setItems(res.data.data || []);
    } catch {
      setSnackbar({ open: true, message: "Failed to fetch items", severity: "error" });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async () => {
    try {
      await axios.post("/api/item", newItem);
      setSnackbar({ open: true, message: "Item added", severity: "success" });
      setAddOpen(false);
      setNewItem({ Name: "", Code: "", HSN_Code: "", Category_Name: "", Group: "", BAR_CODE_TRACKING: "DISABLE" });
      fetchItems();
    } catch {
      setSnackbar({ open: true, message: "Failed to add item", severity: "error" });
    }
  };


  const handleUpdateItem = async (id, rowOverride = null) => {
  const row = rowOverride || items.find((item) => item._id === id);
  if (!row) return;

  const payload = {
    _id: id,
    itemName: row.itemName,
    itemCode: row.itemCode,
    hsnCode: row.hsnCode,
    categoryName: row.categoryName,
    underGroup: row.underGroup,
    barcodeTracking: row.barcodeTracking,
  };

  try {
    await axios.put("/api/item", payload);
    setSnackbar({ open: true, message: "Item updated", severity: "success" });
    fetchItems();
  } catch {
    setSnackbar({ open: true, message: "Failed to update item", severity: "error" });
  }
};

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete("/api/item", { data: { _id: id } });
      setSnackbar({ open: true, message: "Item deleted", severity: "success" });
      fetchItems();
    } catch {
      setSnackbar({ open: true, message: "Failed to delete item", severity: "error" });
    }
  };

  const columns = [
    { field: "itemName", headerName: "Name", width: 180, editable: true },
    { field: "itemCode", headerName: "Code", width: 120, editable: true },
    { field: "hsnCode", headerName: "HSN Code", width: 120, editable: true },
    { field: "categoryName", headerName: "Category", width: 150, editable: true },
    {
      field: "underGroup", headerName: "Group", width: 150, editable: true,
      type: "singleSelect", valueOptions: groups
    },
    {
      field: "barcodeTracking", headerName: "Barcode", width: 120, editable: true,
      type: "singleSelect", valueOptions: barcodeOptions
    },
    {
  field: "actions",
  headerName: "Actions",
  width: 220,
  renderCell: (params) => (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          setEditItem(params.row);
          setEditOpen(true);
        }}
      >
        Edit
      </Button>
  
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => handleDeleteItem(params.row._id)}
      >
        Delete
      </Button>
    </Stack>
  )
}
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Item Master (CRUD Grid)
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setAddOpen(true)}>Add Item</Button>
        <Button variant="outlined" onClick={fetchItems}>Refresh</Button>
      </Stack>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={10}
          disableRowSelectionOnClick
          processRowUpdate={(updatedRow, originalRow) => {
            const hasChanged = Object.keys(updatedRow).some(
              (key) => updatedRow[key] !== originalRow[key]
            );
            if (hasChanged) {
              setEditedRows((prev) => ({ ...prev, [updatedRow._id]: updatedRow }));
            }
            return updatedRow;
          }}
        />
      </Box>

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          {["Name", "Code", "HSN_Code", "Category_Name"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.replace("_", " ")}
              fullWidth
              value={newItem[field]}
              onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
            />
          ))}
          <TextField
            margin="dense"
            label="Group"
            select
            fullWidth
            value={newItem.Group}
            onChange={(e) => setNewItem({ ...newItem, Group: e.target.value })}
          >
            {groups.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>
          <TextField
            margin="dense"
            label="Barcode Tracking"
            select
            fullWidth
            value={newItem.BAR_CODE_TRACKING}
            onChange={(e) => setNewItem({ ...newItem, BAR_CODE_TRACKING: e.target.value })}
          >
            {barcodeOptions.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle>Edit Item</DialogTitle>
  <DialogContent>
    {editItem && (
      <>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          value={editItem.itemName}
          onChange={(e) => setEditItem({ ...editItem, itemName: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Code"
          fullWidth
          value={editItem.itemCode}
          onChange={(e) => setEditItem({ ...editItem, itemCode: e.target.value })}
        />
        <TextField
          margin="dense"
          label="HSN Code"
          fullWidth
          value={editItem.hsnCode}
          onChange={(e) => setEditItem({ ...editItem, hsnCode: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Category Name"
          fullWidth
          value={editItem.categoryName}
          onChange={(e) => setEditItem({ ...editItem, categoryName: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Group"
          select
          fullWidth
          value={editItem.underGroup}
          onChange={(e) => setEditItem({ ...editItem, underGroup: e.target.value })}
        >
          {groups.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
        </TextField>
        <TextField
          margin="dense"
          label="Barcode Tracking"
          select
          fullWidth
          value={editItem.barcodeTracking}
          onChange={(e) => setEditItem({ ...editItem, barcodeTracking: e.target.value })}
        >
          {barcodeOptions.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={() => {
        handleUpdateItem(editItem._id, editItem);
        setEditOpen(false);
      }}
    >
      Save
    </Button>
  </DialogActions>
</Dialog>

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
    </Box>
  );
}