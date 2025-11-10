import React, { useEffect, useState, useRef } from "react";
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

export default function MaterialReceipt() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [party, setParty] = useState("");
  const [receiptDate, setReceiptDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [receiptNo, setReceiptNo] = useState("");
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

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

  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef(null);

  const unitsList = [
    "BAGS","BALE","BUNDLES","BUCKLES","BILLIONS OF UNITS","BOX","BOTTLES",
    "BUNCHES","CANS","CUBIC METER","CUBIC CENTIMETER","CENTIMETER","CARTONS",
    "DOZEN","DRUM","GRAMS","GROSS","GROSS YARDS","KILOGRAMS"
  ];

  // Fetch branches
  useEffect(() => {
    axios.get("/api/branch")
      .then((res) => setBranches(res.data.data || res.data))
      .catch((err) => console.error("Error fetching branches:", err));
  }, []);

  // Fetch items by branch
  useEffect(() => {
    if (!selectedBranch) return;
    axios
      .get(`/api/item?branch=${selectedBranch}`)
      .then((res) => setItems(res.data.data))
      .catch((err) => console.error("Error fetching items:", err));
  }, [selectedBranch]);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  // Handle barcode scan
  const handleBarcodeScan = async () => {
    if (!barcodeInput || !selectedBranch) return;

    try {
      const response = await axios.post("/api/barcodeScan", {
        barcode: barcodeInput,
        branch: selectedBranch,
        user: "placeholder-user-id" // replace with logged-in user ID
      });

      const scannedItem = response.data.data;

      setRows((prev) => {
        const existingIndex = prev.findIndex(i => i.itemId === scannedItem.item);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex].qty += scannedItem.quantity || 1;
          updated[existingIndex].amount = updated[existingIndex].qty * updated[existingIndex].rate;
          return updated;
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              itemId: scannedItem.item,
              itemName: scannedItem.itemName,
              qty: scannedItem.quantity || 1,
              unit: "pcs",
              rate: scannedItem.rate || 0,
              amount: (scannedItem.quantity || 1) * (scannedItem.rate || 0),
              remarks: scannedItem.source || "Scanned via barcode",
            }
          ];
        }
      });

      setTotalAmount((prev) => {
        const updated = [...rows];
        return updated.reduce((sum, r) => sum + r.amount, 0) + (scannedItem.quantity || 1) * (scannedItem.rate || 0);
      });

      setBarcodeInput("");
      barcodeRef.current?.focus();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error scanning barcode",
        severity: "error",
      });
      setBarcodeInput("");
      barcodeRef.current?.focus();
    }
  };

  const handleAddRow = () => {
    if (!selectedBranch) {
      setSnackbar({ open: true, message: "Please select a branch first!", severity: "warning" });
      return;
    }
    setAddOpen(true);
  };

  const handleSaveRow = () => {
    if (!newRow.item) {
      setSnackbar({ open: true, message: "Select an item.", severity: "error" });
      return;
    }

    const itemData = items.find((i) => i._id === newRow.item);
    const entry = {
      id: Date.now(),
      itemId: itemData?._id,
      itemName: itemData?.itemName || "",
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
    if (!selectedBranch || !receiptDate || !receiptNo || rows.length === 0) {
      setSnackbar({ open: true, message: "Please fill all required fields!", severity: "error" });
      return;
    }

    try {
      const payload = {
        branch: selectedBranch,
        receiptDate,
        receiptNo,
        party,
        items: rows.map((r) => ({
          itemId: r.itemId,
          qty: r.qty,
          unit: r.unit,
          rate: r.rate,
          remarks: r.remarks,
        })),
      };

      await axios.post("/api/receipt", payload);
      setSnackbar({ open: true, message: "Receipt saved successfully!", severity: "success" });
      setRows([]);
      setTotalAmount(0);
      setReceiptNo("");
      setBarcodeInput("");
      barcodeRef.current?.focus();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error saving receipt!", severity: "error" });
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Material Receipt
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Branch ★"
          select
          fullWidth
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branches.map((b) => (
            <MenuItem key={b._id} value={b._id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Party"
          fullWidth
          value={party}
          onChange={(e) => setParty(e.target.value)}
        />
        <TextField
          label="Receipt Date"
          type="date"
          fullWidth
          value={receiptDate}
          onChange={(e) => setReceiptDate(e.target.value)}
        />
        <TextField
          label="Receipt No"
          fullWidth
          value={receiptNo}
          onChange={(e) => setReceiptNo(e.target.value)}
        />
      </Stack>

      {/* Barcode Input */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          label="Scan Barcode"
          fullWidth
          value={barcodeInput}
          inputRef={barcodeRef}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleBarcodeScan();
            }
          }}
        />
        <Button variant="contained" onClick={handleBarcodeScan}>
          Add Item
        </Button>
      </Stack>

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Received Items</Typography>
        <Button variant="contained" onClick={handleAddRow}>Add Item Manually</Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        pageSize={5}
      />

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Typography variant="subtitle1">
          <b>Total Amount: ₹{totalAmount.toFixed(2)}</b>
        </Typography>
      </Box>

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button variant="contained" onClick={handleSubmit}>Save Receipt</Button>
      </Box>

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Item"
            fullWidth
            select
            value={newRow.item}
            onChange={(e) => setNewRow({ ...newRow, item: e.target.value })}
          >
            {items.map((i) => (
              <MenuItem key={i._id} value={i._id}>
                {i.itemName} ({i.itemCode})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Unit"
            select
            fullWidth
            value={newRow.unit}
            onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })}
          >
            {unitsList.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>

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
          <Button variant="contained" onClick={handleSaveRow}>
            Add
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
    </Box>
  );
}
