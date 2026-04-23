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
import {
  DataGrid, useGridApiRef,
  DEFAULT_GRID_AUTOSIZE_OPTIONS, gridClasses, GridAutosizeOptions,
} from "@mui/x-data-grid";
import AddIcon from '@mui/icons-material/Add';

import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import dayjs from "dayjs";
import { exportToExcel } from "@/utils/exportToExcel";

export default function MaterialReceipt() {
  /* ================= STATES ================= */
  const apiRef = useGridApiRef();

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [party, setParty] = useState("");
  const [receiptDate, setReceiptDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [receiptNo, setReceiptNo] = useState("");
  const commonFieldProps = { size: "small", fullWidth: true };

  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [newRow, setNewRow] = useState({
    item: "",
    qty: 1,
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

  /* ================= FETCH ================= */
  useEffect(() => {
    // Fetch all branches
    axios.get("/api/branch")
      .then(res => setBranches(res.data.data || res.data))
      .catch(err => console.error("Branch error", err));
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    // Fetch items of the selected branch
    axios.get(`/api/item?branch=${selectedBranch}`)
      .then(res => setItems(res.data.data))
      .catch(err => console.error("Item error", err));
  }, [selectedBranch]);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);
  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.autosizeColumns({
        ...DEFAULT_GRID_AUTOSIZE_OPTIONS,
        includeHeaders: true,
        includeOutliers: true,
      });
    }
  }, [rows]);

  /* ================= BARCODE SCAN ================= */
  const handleBarcodeScan = async () => {
    if (!barcodeInput || !selectedBranch) return;

    try {
      const res = await axios.get(`/api/receipt?barcode=${barcodeInput}`);
      const scanned = res.data.data;

      setRows(prev => {
        const existing = prev.find(r => r.itemId === scanned._id);
        let updated;

        if (existing) {
          updated = prev.map(r =>
            r.itemId === scanned._id
              ? { ...r, qty: r.qty + 1, amount: (r.qty + 1) * r.rate }
              : r
          );
        } else {
          updated = [
            ...prev,
            {
              id: Date.now(),
              itemId: scanned._id,
              itemName: scanned.itemName,
              qty: 1,
              unit: scanned.stockUnit || "pcs",
              rate: scanned.rate || 0,
              amount: scanned.rate || 0,
              remarks: "Barcode Scan",
            },
          ];
        }

        setTotalAmount(updated.reduce((s, r) => s + r.amount, 0));
        return updated;
      });

      setBarcodeInput("");
      barcodeRef.current?.focus();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid barcode",
        severity: "error",
      });
      setBarcodeInput("");
    }
  };

  /* ================= MANUAL ADD ITEM ================= */
  const handleSaveRow = () => {
    if (!newRow.item) {
      setSnackbar({ open: true, message: "Select an item", severity: "error" });
      return;
    }

    const item = items.find(i => i._id === newRow.item);
    if (!item) return;

    const existing = rows.find(r => r.itemId === item._id);
    let updated;

    if (existing) {
      updated = rows.map(r =>
        r.itemId === item._id
          ? { ...r, qty: r.qty + newRow.qty, amount: (r.qty + newRow.qty) * r.rate }
          : r
      );
    } else {
      updated = [
        ...rows,
        {
          id: Date.now(),
          itemId: item._id,
          itemName: item.itemName,
          qty: newRow.qty,
          unit: newRow.unit,
          rate: newRow.rate,
          amount: newRow.qty * newRow.rate,
          remarks: newRow.remarks,
        },
      ];
    }

    setRows(updated);
    setTotalAmount(updated.reduce((s, r) => s + r.amount, 0));
    setAddOpen(false);

    setNewRow({
      item: "",
      qty: 1,
      unit: "",
      rate: 0,
      amount: 0,
      remarks: "",
    });
  };

  /* ================= SAVE RECEIPT ================= */
  const handleSubmit = async () => {
    if (!selectedBranch || !receiptDate || !receiptNo || rows.length === 0) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields!",
        severity: "error",
      });
      return;
    }

    const payload = {
      branch: selectedBranch,
      receiptDate,
      receiptNo,
      party,
      items: rows.map(r => ({
        itemId: r.itemId,
        qty: r.qty,
        unit: r.unit,
        rate: r.rate,
        amount: r.amount,
        remarks: r.remarks,
      })),
    };

    try {
      await axios.post("/api/receipt", payload);

      setSnackbar({
        open: true,
        message: "Material receipt saved successfully!",
        severity: "success",
      });

      setRows([]);
      setTotalAmount(0);
      setReceiptNo("");
      setParty("");
      setBarcodeInput("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error saving receipt!",
        severity: "error",
      });
    }
  };
  const handleSaveAndExport = async () => {
    if (!selectedBranch || !receiptDate || !receiptNo || rows.length === 0) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields!",
        severity: "error",
      });
      return;
    }

    const payload = {
      branch: selectedBranch,
      receiptDate,
      receiptNo,
      party,
      items: rows.map(r => ({
        itemId: r.itemId,
        qty: r.qty,
        unit: r.unit,
        rate: r.rate,
        amount: r.amount,
        remarks: r.remarks,
      })),
    };

    try {
      // ✅ Save first
      await axios.post("/api/receipt", payload);

      // ✅ Then export
      exportToExcel({
        fileName: `materialReceipt-${receiptNo}.xlsx`,
        sheetName: "Material Receipt",
        columns,
        rows,
      });

      setSnackbar({
        open: true,
        message: "Saved & Exported successfully!",
        severity: "success",
      });

      // reset
      setRows([]);
      setTotalAmount(0);
      setReceiptNo("");
      setParty("");
      setBarcodeInput("");

    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error saving receipt!",
        severity: "error",
      });
    }
  };

  /* ================= DELETE ROW ================= */
  const handleDeleteRow = (id) => {
    const updated = rows.filter(r => r.id !== id);
    setRows(updated);
    setTotalAmount(updated.reduce((s, r) => s + r.amount, 0));
  };

  /* ================= GRID COLUMNS ================= */
  const columns = [
    { field: "itemName", headerName: "Item Name", width: 200 },
    { field: "qty", headerName: "Qty", width: 80 },
    { field: "unit", headerName: "Unit", width: 100 },
    { field: "rate", headerName: "Rate (₹)", width: 120 },
    { field: "amount", headerName: "Amount (₹)", width: 140 },
    { field: "remarks", headerName: "Remarks", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Button color="error" onClick={() => handleDeleteRow(params.row.id)}>Delete</Button>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: { mb: 2, xs: 'center', sm: 'flex-end' } }}>
        <Button
          variant="outlined"
          color="success"
          onClick={handleSaveAndExport}
        >
          Save & Export Excel
        </Button>
      </Box>
      <Typography variant="h5" fontWeight="bold">Material Receipt</Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ my: 2 }}>
        <TextField select label="Branch ★" fullWidth
              {...commonFieldProps}
                sx={{
                  minWidth: 180,
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)', // 🔥 makes icon white in dark mode
                    cursor: 'pointer',
                  },
                }}
          value={selectedBranch}
          onChange={e => setSelectedBranch(e.target.value)}>
          {branches.map(b => (
            <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
          ))}
        </TextField>

        <TextField label="Party" fullWidth
              {...commonFieldProps}
                sx={{
                  minWidth: 180,
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)', // 🔥 makes icon white in dark mode
                    cursor: 'pointer',
                  },
                }} value={party}
          onChange={e => setParty(e.target.value)} />

        <TextField type="date" label="Receipt Date" fullWidth
              {...commonFieldProps}
                sx={{
                  minWidth: 180,
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)', // 🔥 makes icon white in dark mode
                    cursor: 'pointer',
                  },
                }}
          value={receiptDate}
          onChange={e => setReceiptDate(e.target.value)} />

        <TextField label="Receipt No" fullWidth
              {...commonFieldProps}
                sx={{
                  minWidth: 180,
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)', // 🔥 makes icon white in dark mode
                    cursor: 'pointer',
                  },
                }}
          value={receiptNo}
          onChange={e => setReceiptNo(e.target.value)}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />
      </Stack>


      <Button variant="outlined"
       sx={{ mb: 2, float: 'right', m: 2, 
       justifyContent: { xs: "center", sm: "flex-end" } }} 
       onClick={() => setAddOpen(true)}><AddIcon/>Add Items to inventory</Button>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          autoHeight
          getRowId={row => row.id}
          disableRowSelectionOnClick
          pageSize={5}
        />
      </Box>


      <Typography align="right" sx={{ mt: 2 }}>
        <b>Total Amount: ₹{totalAmount.toFixed(2)}</b>
      </Typography>

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button variant="outlined" color="success" onClick={handleSubmit}>Save Receipt</Button>
      </Box>

      {/* ================= ADD ITEM DIALOG ================= */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Item" sx={{ mt: 2 }}
            value={newRow.item}
            onChange={e => {
              const item = items.find(i => i._id === e.target.value);
              setNewRow({
                ...newRow,
                item: item._id,
                unit: item.stockUnit || "pcs",
                rate: item.rate || 0,
                qty: 1,
                amount: item.rate || 0,
              });
            }}>
            {items.map(i => (
              <MenuItem key={i._id} value={i._id}>{i.itemName}</MenuItem>
            ))}
          </TextField>

          <TextField label="Unit" fullWidth sx={{ mt: 2 }} value={newRow.unit} InputProps={{ readOnly: true }} />
          <TextField label="Quantity" type="number" fullWidth sx={{ mt: 2 }}
            value={newRow.qty}
            onChange={e => setNewRow({
              ...newRow,
              qty: +e.target.value,
              amount: +e.target.value * newRow.rate,
            })} />
          <TextField label="Rate (₹)" type="number" fullWidth sx={{ mt: 2 }}
            value={newRow.rate}
            onChange={e => setNewRow({
              ...newRow,
              rate: +e.target.value,
              amount: newRow.qty * +e.target.value,
            })} />
          <TextField label="Amount (₹)" fullWidth sx={{ mt: 2 }} value={newRow.amount.toFixed(2)} InputProps={{ readOnly: true }} />
          <TextField label="Remarks" fullWidth sx={{ mt: 2 }} value={newRow.remarks} onChange={e => setNewRow({ ...newRow, remarks: e.target.value })} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRow}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* ================= SNACKBAR ================= */}
      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
