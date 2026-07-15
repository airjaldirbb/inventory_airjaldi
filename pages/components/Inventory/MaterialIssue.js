import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import dayjs from "dayjs";
import AddIcon from '@mui/icons-material/Add';


export default function MaterialIssue() {
  const commonFieldProps = { size: "small", fullWidth: true };

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [issueDate, setIssueDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [issueNo, setIssueNo] = useState("");
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [issues, setIssues] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [amount, setAmount] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [newRow, setNewRow] = useState({
    item: "",
    qty: 0,
    unit: "",
    rate: 0,
    amount: 0,
    remarks: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  // Fetch branches
  useEffect(() => {
    axios
      .get("/api/branch")
      .then((res) => setBranches(res.data))
      .catch((err) => console.error("Error fetching branches:", err));
  }, []);

  // Fetch items when branch is selected
  useEffect(() => {
    if (!selectedBranch) return;
    axios
      .get(`/api/item?branch=${selectedBranch}`)
      .then((res) => {
        setItems(res.data.data);
        console.log(res.data.data)
      })
      .catch((err) => console.error("Error fetching items:", err));
  }, [selectedBranch]);

  // Fetch material issues
  useEffect(() => {
    axios
      .get("/api/issue")
      .then((res) => setIssues(res.data.data))
      .catch((err) => console.error("Error fetching material issues:", err));
  }, []);

  const handleAddRow = () => {
    if (!selectedBranch) {
      setSnackbar({
        open: true,
        message: "Please select a branch first!",
        severity: "warning",
      });
      return;
    }
    setAddOpen(true);
  };

  const handleSaveRow = () => {
    if  (!selectedItem){
      setSnackbar({ open: true, message: "Select an item.", severity: "error" });
      return;
    }

    const itemData = items.find((i) => i._id === newRow.item);
  const entry = {
  id: Date.now(),
  itemId: selectedItem._id,
  itemName: selectedItem.itemName,
  qty: newRow.qty,
  unit: newRow.unit,
  rate: newRow.rate,
  amount: newRow.qty * newRow.rate,
  remarks: newRow.remarks,
};

    const updatedRows = [...rows, entry];
    setRows(updatedRows);
    setTotalAmount(updatedRows.reduce((sum, r) => sum + r.amount, 0));
    setAddOpen(false);
    setNewRow({ item: "", qty: 0, unit: "", rate: 0, amount: 0, remarks: "" });
    setSnackbar({ open: true, message: "Item added successfully!", severity: "success" });
  };

  const handleSubmit = async () => {
    if (!selectedBranch || !issueDate || !issueNo || rows.length === 0) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields!",
        severity: "error",
      });
      return;
    }

    try {
      const payload = {
        branch: selectedBranch,
        issueDate,
        issueNo,
        issuedTo,
        items: rows.map((r) => ({
          itemId: r.itemId,
          qty: r.qty,
          unit: r.unit,
          rate: r.rate,
          remarks: r.remarks,
        })),
      };


      setSnackbar({ open: true, message: "Material issue saved successfully!", severity: "success" });

      // Refresh issues
      const updatedList = await axios.get("/api/issue",payload  );
      setIssues(updatedList.data.data);
      setRows([]);
      setTotalAmount(0);
    } catch (error) {
      console.error("Save error:", error);
      setSnackbar({ open: true, message: "Error saving issue!", severity: "error" });
    }
  };

  const columns = [
    { field: "itemName", headerName: "Item", width: 200 },
    { field: "qty", headerName: "Qty", width: 100 },
    { field: "unit", headerName: "Unit", width: 120 },
    { field: "rate", headerName: "Rate (₹)", width: 120 },
    { field: "amount", headerName: "Amount (₹)", width: 150 },
    { field: "remarks", headerName: "Remarks", width: 180 },
  ];
  const clearItemDialog = () => {
    setSelectedItem(null);
    setQuantity(1);
    setRate(0);
    setAmount(0);
    setSelectedUnit("");
    setFormState(prev => ({ ...prev, tax: "" }));
  };


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Material Issue
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Branch ★"
          select
          fullWidth
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          {...commonFieldProps}
          sx={{

            '& input::-webkit-calendar-picker-indicator': {
              filter: 'invert(1)', // 🔥 makes icon white in dark mode
              cursor: 'pointer',
            },
          }}
        >
          {branches.map((b) => (
            <MenuItem key={b._id} value={b._id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Issued To"
          fullWidth
          value={issuedTo}
          onChange={(e) => setIssuedTo(e.target.value)}
          {...commonFieldProps}
          sx={{

            '& input::-webkit-calendar-picker-indicator': {
              filter: 'invert(1)', // 🔥 makes icon white in dark mode
              cursor: 'pointer',
            },
          }}

        />

        <TextField
          label="Issue Date"
          type="date"
          fullWidth
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          {...commonFieldProps}
          sx={{

            '& input::-webkit-calendar-picker-indicator': {
              filter: 'invert(1)', // 🔥 makes icon white in dark mode
              cursor: 'pointer',
            },
          }}
        />

        <TextField
          label="Issue No"
          fullWidth
          value={issueNo}
          onChange={(e) => setIssueNo(e.target.value)}
          {...commonFieldProps}
          sx={{

            '& input::-webkit-calendar-picker-indicator': {
              filter: 'invert(1)', // 🔥 makes icon white in dark mode
              cursor: 'pointer',
            },
          }}
        />

      </Stack>

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        {/* <Typography variant="h6">Issued Items</Typography> */}
        <Button variant="outlined" onClick={handleAddRow}><AddIcon />Add Items to inventory</Button>
      </Stack>
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Box sx={{ minWidth: 400 }}>

          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            pageSize={5}
          />
        </Box>
      </Box>


      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Typography variant="subtitle1">
          <b>Total Amount: ₹{totalAmount.toFixed(2)}</b>
        </Typography >
      </Box>

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button variant="outlined" color="success" onClick={handleSubmit}>Save Issue</Button>
      </Box>

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>

          <TextField
            select
            fullWidth
            label="Select Item"
            value={selectedItem?._id || ""}
            onChange={(e) => {
              const item = items.find(i => i._id === e.target.value);

              if (!item) {
                clearItemDialog();
                return;
              }

              setSelectedItem(item);
              setRate(item.rate || 0);
              setQuantity(1);
              setSelectedUnit(item.stockUnit || "Pcs");
            }}
            sx={{ mt: 2 }}
          >
            {items.map(i => (
              <MenuItem key={i._id} value={i._id}>
                {i.itemName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Unit"
            value={selectedUnit}
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
          />


          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={newRow.qty}
            onChange={(e) => {
              const qty = Number(e.target.value);
              setNewRow({ ...newRow, qty, amount: qty * newRow.rate });
            }}
          />

          <TextField
            margin="dense"
            label="Rate (₹)"
            type="number"
            fullWidth
            value={newRow.rate}
            onChange={(e) => {
              const rate = Number(e.target.value);
              setNewRow({ ...newRow, rate, amount: rate * newRow.qty });
            }}
          />

          <TextField
            margin="dense"
            label="Amount (₹)"
            fullWidth
            value={newRow.amount.toFixed(2)}
            InputProps={{ readOnly: true }}
          />

          <TextField
            margin="dense"
            label="Remarks"
            fullWidth
            value={newRow.remarks}
            onChange={(e) => setNewRow({ ...newRow, remarks: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRow}>Add</Button>
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
    </Box>
  );
}
