import React, { useEffect, useState } from "react";
import {
  Box, Typography, Snackbar, Button, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import AddIcon from '@mui/icons-material/Add';

export default function ItemMasterGrid() {
  const [items, setItems] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    Name: "", Code: "", HSN_Code: "", Category_Name: "",
    Group: "", BAR_CODE_TRACKING: "DISABLE", stockUnit: "Pcs"
  });

  const groups = ["Consumption", "Fiber Equipments", "Wireless CPE", "Assets"];
  const barcodeOptions = ["ENABLE", "DISABLE"];
  const stockUnits = ["Pcs", "Mtr", "Kg", "Litre", "Box"];

  // Fetch items from API
  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/item");
      // Map API fields to DataGrid row fields
      const mappedItems = res.data.data.map(item => ({
        ...item,
        Name: item.itemName || "",
        Code: item.itemCode || "",
        HSN_Code: item.hsnCode || "",
        Category_Name: item.categoryName || "",
        Group: item.underGroup || "",
        BAR_CODE_TRACKING: item.barcodeTracking || "DISABLE",
        stockUnit: item.stockUnit || "Pcs"
      }));
      setItems(mappedItems);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to fetch items", severity: "error" });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  const handleAddItem = async () => {
    try {
      // ✅ Frontend validation (prevents silent failure)
      if (!newItem.Name || !newItem.Code || !newItem.Group) {
        return setSnackbar({
          open: true,
          message: "Name, Code & Group are required",
          severity: "error"
        });
      }

      // ✅ Clean payload (matches API expectations exactly)
      const payload = {
        Name: newItem.Name.trim(),
        Code: newItem.Code.trim(),
        HSN_Code: newItem.HSN_Code?.trim() || "",
        Category_Name: newItem.Category_Name?.trim() || "",
        Group: newItem.Group,
        BAR_CODE_TRACKING: newItem.BAR_CODE_TRACKING,
        stockUnit: newItem.stockUnit
      };


      const res = await axios.post("/api/item", payload);

      setSnackbar({
        open: true,
        message: res.data.message || "Item added",
        severity: "success"
      });

      setAddOpen(false);

      // ✅ Reset with valid defaults
      setNewItem({
        Name: "",
        Code: "",
        HSN_Code: "",
        Category_Name: "",
        Group: "Consumption", // ✅ IMPORTANT
        BAR_CODE_TRACKING: "DISABLE",
        stockUnit: "Pcs"
      });

      fetchItems();

    } catch (err) {
      console.error("ADD ERROR:", err.response?.data || err.message);

      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to add item",
        severity: "error"
      });
    }
  };

  // Update item
  const handleUpdateItem = async (id, row) => {
    try {
      const payload = {
        _id: id,
        itemName: row.Name,
        itemCode: row.Code,
        hsnCode: row.HSN_Code,
        categoryName: row.Category_Name,
        underGroup: row.Group,
        barcodeTracking: row.BAR_CODE_TRACKING,
        stockUnit: row.stockUnit
      };
      await axios.put("/api/item", payload);
      setSnackbar({ open: true, message: "Item updated", severity: "success" });
      fetchItems();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to update item", severity: "error" });
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete("/api/item", { data: { _id: id } });
      setSnackbar({ open: true, message: "Item deleted", severity: "success" });
      fetchItems();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete item", severity: "error" });
    }
  };

  const columns = [
    { field: "Name", headerName: "Name", width: 180, editable: true },
    { field: "Code", headerName: "Code", width: 120, editable: true },
    { field: "HSN_Code", headerName: "HSN Code", width: 120, editable: true },
    { field: "stockUnit", headerName: "Stock Unit", width: 120, editable: true, type: "singleSelect", valueOptions: stockUnits },
    { field: "Category_Name", headerName: "Category", width: 150, editable: true },
    { field: "Group", headerName: "Group", width: 150, editable: true, type: "singleSelect", valueOptions: groups },
    { field: "BAR_CODE_TRACKING", headerName: "Barcode", width: 120, editable: true, type: "singleSelect", valueOptions: barcodeOptions },
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
        Item Master
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => setAddOpen(true)}><AddIcon />Add Items to Inventory</Button>
        <Button variant="outlined" color="success" onClick={fetchItems}>Refresh</Button>
      </Stack>

      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Box sx={{ minWidth: 1000 }}>
          <DataGrid
            rows={items}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={10}
            disableRowSelectionOnClick
            processRowUpdate={(updatedRow) => {
              handleUpdateItem(updatedRow._id, updatedRow);
              return updatedRow;
            }}
          />
        </Box>

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
          <TextField margin="dense" label="Group" select fullWidth value={newItem.Group} onChange={(e) => setNewItem({ ...newItem, Group: e.target.value })}>
            {groups.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>
          <TextField margin="dense" label="Barcode Tracking" select fullWidth value={newItem.BAR_CODE_TRACKING} onChange={(e) => setNewItem({ ...newItem, BAR_CODE_TRACKING: e.target.value })}>
            {barcodeOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
          <TextField margin="dense" label="Stock Unit" select fullWidth value={newItem.stockUnit} onChange={(e) => setNewItem({ ...newItem, stockUnit: e.target.value })}>
            {stockUnits.map(unit => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          {editItem && ["Name", "Code", "HSN_Code", "Category_Name", "Group", "BAR_CODE_TRACKING", "stockUnit"].map(field => (
            <TextField
              key={field}
              margin="dense"
              label={field.replace("_", " ")}
              fullWidth
              select={["Group", "BAR_CODE_TRACKING", "stockUnit"].includes(field)}
              value={editItem[field]}
              onChange={(e) => setEditItem({ ...editItem, [field]: e.target.value })}
            >
              {field === "Group" && groups.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              {field === "BAR_CODE_TRACKING" && barcodeOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              {field === "stockUnit" && stockUnits.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { handleUpdateItem(editItem._id, editItem); setEditOpen(false); }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
