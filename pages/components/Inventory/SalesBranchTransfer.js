import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Typography, Container
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete"
import axios from "axios";

export default function SalesBranchTransfer() {
  const [phone, setPhone] = useState("");

  const commonFieldProps = { fullWidth: true, size: "small" };
  const [jazeCustomerDetails, setJazeCustomerDetails] = useState(null);
  // ========== FORM STATE ==========
  const [formState, setFormState] = useState({
    gstType: "",
    cashCredit: "",
    branch: "",
    fromBranch: "",
    toBranch: "",
    customer: "",
    email: "",
    date: new Date().toISOString().slice(0, 10),
    invoiceNo: "",
    refNo: "",
    refDate: "",
    agent: "",
    tax: "",
    paymentStatus: "UNPAID",
  });

  // ========== DROPDOWN DATA ==========
  const [branches, setBranches] = useState([]);
  const [selectedFromBranch, setSelectedFromBranch] = useState(null);
  const [selectedToBranch, setSelectedToBranch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [agents, setAgents] = useState([]);

  // ========== SALES INVOICE ROWS ==========
  const [rows, setRows] = useState([]);
  // ========== ADD ITEM MODAL ==========
  const [openAddItem, setOpenAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [amount, setAmount] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);
  // ========== SNACKBAR ==========
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };
  // ================= LOAD DATA =================
  useEffect(() => {
    axios.get("/api/branch").then(res => setBranches(res.data)).catch(err => console.error(err));
    axios.get("/api/customer").then(res => setCustomers(res.data)).catch(err => console.error(err));
    axios.get("/api/AgentDropDown").then(res => setAgents(res.data.data || [])).catch(err => console.error(err));
  }, []);

  // Load items when branch changes

  useEffect(() => {
    if (!formState.fromBranch) return;

    axios.get(`/api/item?branch=${formState.fromBranch}`)
      .then(res => {
        setItems(res.data.data || []);
      })
      .catch(err => console.error(err));

  }, [formState.fromBranch]);

  // ================= CALCULATE AMOUNT =================

  useEffect(() => {
    const gstPercentage = parseFloat((formState.tax || "0").replace("%", ""));
    const gstAmount = (quantity * rate * gstPercentage) / 100;
    setAmount(quantity * rate + gstAmount);
  }, [quantity, rate, formState.tax]);

  // ================= DELETE ROW =================

  const handleDeleteRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };

  // ================= SAVE INVOICE =================

  const handleSaveInvoice = async () => {
    if (rows.length === 0) {
      showSnackbar("Add at least one item to save invoice", "error");
      return;
    }

    if (!formState.fromBranch || !formState.toBranch) {
      showSnackbar("Please fill From Branch, To Branch", "error");
      return;
    }
    if (formState.fromBranch === formState.toBranch) {
      showSnackbar("From and To branch cannot be same");
      return;
    }
    try {
      const payload = {
        invoiceNumber: formState.invoiceNo || undefined,
        invoiceDate: formState.date || new Date().toISOString().slice(0, 10),

        agent: formState.agent || null,
        fromBranch: formState.fromBranch,
        toBranch: formState.toBranch,
        gstType: formState.gstType || "TAX_INVOICE",
        paymentMode: formState.cashCredit || "CASH",
        items: rows.map(r => ({
          item: r._id,
          quantity: r.quantity,
          rate: r.rate,
          unit: r.unit || "pcs",
          gstPercentage: r.gstPercentage || 0,
          gstAmount: r.gstAmount || 0,
          total: r.total || 0,
        })),

        totalAmount: totals.totalAmount,
        totalGST: totals.totalGST,
        netAmount: totals.roundedNetAmount,
        roundOff: totals.roundOff,
        totalAmount: rows.reduce((sum, r) => sum + r.total, 0),
        totalGST: rows.reduce((sum, r) => sum + r.gstAmount, 0),
        netAmount: rows.reduce((sum, r) => sum + r.total + r.gstAmount, 0),
        paymentStatus: formState.paymentStatus || "UNPAID",
      };
      
      await axios.post("/api/SalesBranchTransfer", payload);
      showSnackbar("Invoice saved successfully", "success");
      // Reset form for next invoice
      setRows([]);
      setFormState({
        gstType: "",
        cashCredit: "",


        email: "",
        date: new Date().toISOString().slice(0, 10),
        invoiceNo: "",
        refNo: "",
        refDate: "",
        agent: "",
        tax: "",
        paymentStatus: "UNPAID",
      });
      setSelectedBranch(null);
      setSelectedItem("");
      setSelectedFromBranch(null);
      setSelectedToBranch(null);
      setQuantity(1);
      setRate(0);
      setAmount(0);
      setSelectedUnit("");
    } catch (err) {
      console.error("Error saving invoice:", err.response?.data || err.message);
      showSnackbar("Error saving invoice", "error");
    }
  };

  const handleAddItemToGrid = () => {
    if (!selectedItem) {
      showSnackbar("Please select an item", "error");
      return;
    }

    const gstPercentage = parseFloat((formState.tax || "0").replace("%", ""));
    const itemTotal = quantity * rate;
    const gstAmount = (itemTotal * gstPercentage) / 100;
    const selectedAgent = agents.find(a => a._id === formState.agent);
    const newRow = {
      ...selectedItem,
      quantity,
      rate,
      total: itemTotal,
      gstPercentage,
      gstAmount,
      totalWithGST: itemTotal + gstAmount,
      unit: selectedItem.stockUnit || "Pcs",
      rowId: editingRowId || Date.now() + Math.random(),
      agentId: selectedAgent?._id || "",
      name: selectedAgent?.name || "",
    };

    if (editingRowId) {
      // ✅ UPDATE EXISTING ROW
      setRows(prev =>
        prev.map(r => (r.rowId === editingRowId ? newRow : r))
      );
    } else {
      // ✅ ADD NEW ROW
      setRows(prev => [...prev, newRow]);
    }

    // 🔹 RESET EDIT MODE
    setEditingRowId(null);
    clearItemDialog();
    setOpenAddItem(false);
    showSnackbar(editingRowId ? "Item updated" : "Item added");
  };
  // const totals = React.useMemo(() => {
  //   let totalAmount = 0;
  //   let totalGST = 0;

  //   rows.forEach(r => {
  //     totalAmount += r.total || 0;
  //     totalGST += r.gstAmount || 0;
  //   });

  //   return {
  //     totalAmount,
  //     totalGST,
  //     netAmount: totalAmount + totalGST,
  //   };
  // }, [rows]);

  const totals = React.useMemo(() => {
    let totalAmount = 0;
    let totalGST = 0;

    rows.forEach(r => {
      totalAmount += r.total || 0;
      totalGST += r.gstAmount || 0;
    });

    const netAmount = totalAmount + totalGST;

    // ✅ ROUND OFF
    const roundedNetAmount = Math.round(netAmount);
    const roundOff = roundedNetAmount - netAmount;

    return {
      totalAmount,
      totalGST,
      netAmount,
      roundedNetAmount,
      roundOff,
    };
  }, [rows]);
  const handleEditRow = (row) => {
    setSelectedItem(row);
    setQuantity(row.quantity);
    setRate(row.rate);
    setSelectedUnit(row.unit);

    setFormState(prev => ({
      ...prev,
      tax: row.gstPercentage + "%"
    }));

    setEditingRowId(row.rowId); // ✅ IMPORTANT

    setOpenAddItem(true);
  };
  // ================= GRID COLUMNS =================
  const columns = [
    { field: "delete", headerName: "Delete", width: 90, renderCell: (params) => <Button color="error" onClick={() => handleDeleteRow(params.row.rowId)}><DeleteIcon /></Button> },
    { field: "itemName", headerName: "Item", width: 150 },
    { field: "itemCode", headerName: "Code", width: 120 },
    { field: "name", headerName: "Agent", width: 120 },
    { field: "openingStock", headerName: "Stock", width: 120 },
    { field: "quantity", headerName: "Qty", width: 100 },
    { field: "rate", headerName: "Rate", width: 100 },
    { field: "total", headerName: "Subtotal", width: 120 },
    { field: "gstAmount", headerName: "GST", width: 100 },
    { field: "totalWithGST", headerName: "Total", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleEditRow(params.row)} // 👈 row edit
        >
          Edit
        </Button>
      ),
    },
  ];
  const clearItemDialog = () => {
    setSelectedItem(null);
    setQuantity(1);
    setRate(0);
    setAmount(0);
    setSelectedUnit("");
    setFormState(prev => ({ ...prev, tax: "" }));
  };


  const combinedRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );
  return (
    <>

      <Container maxWidth="xl" sx={{ width: "100%", p: 1 }}>
        <Grid container spacing={2}>

          {/* GST Type */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...commonFieldProps} fullWidth select label="GST Type"
              sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              value={formState.gstType}
              onChange={(e) => setFormState({ ...formState, gstType: e.target.value })}
            >
              <MenuItem value="TAX_INVOICE">Tax Invoice</MenuItem>
              <MenuItem value="REGISTERED">Registered</MenuItem>
              <MenuItem value="COMPOSITION">Composition</MenuItem>
            </TextField>
          </Grid>

          {/* Cash */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...commonFieldProps} fullWidth select label="Cash"
              sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              value={formState.cashCredit}
              onChange={(e) => setFormState({ ...formState, cashCredit: e.target.value })}
            >
              <MenuItem value="CASH">Cash</MenuItem>
            </TextField>
          </Grid>

          {/* From Branch */}
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              {...commonFieldProps}
              sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              fullWidth
              options={branches}
              value={selectedFromBranch}
              onChange={(e, newValue) => {
                setSelectedFromBranch(newValue);
                setFormState(prev => ({ ...prev, fromBranch: newValue?._id || "" }));
              }}
              getOptionLabel={(o) => o?.name || ""}
              renderInput={(params) => <TextField {...params} label="From Branch" />}
            />
          </Grid>

          {/* To Branch */}
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              {...commonFieldProps}

              sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              fullWidth
              options={branches}
              value={selectedToBranch}
              onChange={(e, newValue) => {
                setSelectedToBranch(newValue);
                setFormState(prev => ({ ...prev, toBranch: newValue?._id || "" }));
              }}
              getOptionLabel={(o) => o?.name || ""}
              renderInput={(params) => <TextField {...params} label="To Branch" />}
            />
          </Grid>

          {/* Invoice Date */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...commonFieldProps}
             
              fullWidth type="date" label="Invoice Date"

              InputLabelProps={{ shrink: true }}
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                 sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
            />
          </Grid>

          {/* Invoice No */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...commonFieldProps}
              sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
             fullWidth label="Invoice No"
              value={formState.invoiceNo}
              onChange={(e) => setFormState({ ...formState, invoiceNo: e.target.value })}
            />
          </Grid>

          {/* Agent */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...commonFieldProps} fullWidth select label="Agent"
              sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              value={formState.agent}
              onChange={(e) => setFormState({ ...formState, agent: e.target.value })}
            >
              {agents.map(a => (
                <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Ref No */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...commonFieldProps} fullWidth label="Ref No"   sx={{
                minWidth: 180,
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // 🔥 makes icon white in dark mode
                  cursor: 'pointer',
                },
              }}
              value={formState.refNo}
              onChange={(e) => setFormState({ ...formState, refNo: e.target.value })}
            />
          </Grid>

          {/* Ref Date */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField {...commonFieldProps} fullWidth type="date" label="Ref Date"
              InputLabelProps={{ shrink: true }}
              value={formState.refDate}
              onChange={(e) => setFormState({ ...formState, refDate: e.target.value })}
              sx={{
                '& input::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)',
                },
              }}
            />
          </Grid>

        </Grid>
      </Container>
      <Box
        mt={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* <Typography variant="h6">Items</Typography> */}

        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpenAddItem(true)}
        >
          <AddIcon></AddIcon> Add Item to inventory
        </Button>
      </Box>

      <Box sx={{ height: 350, width: "100%", mt: 2 }}>
        <DataGrid
          rows={combinedRows}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={10}
          disableRowSelectionOnClick
        />
      </Box>
      <Box mt={2} sx={{ textAlign: "right", pr: 2 }}>
        <Typography>Total Amount: ₹ {totals.totalAmount.toFixed(2)}</Typography>
        <Typography>Total GST: ₹ {totals.totalGST.toFixed(2)}</Typography>
        <Typography>Round Off: ₹ {totals.roundOff.toFixed(2)}</Typography>

        <Typography fontWeight="bold" fontSize={16}>
          Net Amount: ₹ {totals.roundedNetAmount?.toFixed(2)}
        </Typography>
      </Box>
      <Dialog open={openAddItem} fullWidth maxWidth="sm">
        <DialogTitle>Add Item</DialogTitle>

        <DialogContent dividers>

          <TextField
            select fullWidth label="Select Item"
            value={selectedItem?._id || ""}
            onChange={(e) => {
              const item = items.find(i => i._id === e.target.value);
              if (!item) return clearItemDialog();

              setSelectedItem(item);
              setRate(item.rate || 0);
              setQuantity(1);
              setSelectedUnit(item.stockUnit || "Pcs");
            }}
            sx={{ mt: 1 }}
          >
            {items.map(i => (
              <MenuItem key={i._id} value={i._id}>
                {i.itemName}
              </MenuItem>
            ))}
          </TextField>

          <TextField fullWidth label="Unit" value={selectedUnit} InputProps={{ readOnly: true }} sx={{ mt: 2 }} />
          <TextField fullWidth type="number" label="Quantity" sx={{ mt: 2 }} value={quantity} onChange={(e) => setQuantity(+e.target.value)} />
          <TextField fullWidth type="number" label="Rate" sx={{ mt: 2 }} value={rate} onChange={(e) => setRate(+e.target.value)} />
          <TextField fullWidth label="Amount" sx={{ mt: 2 }} value={amount.toFixed(2)} InputProps={{ readOnly: true }} />

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAddItem(false)}>Cancel</Button>
          <Box
            mt={2}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Items</Typography>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddItem(true)}
            >
              <AddIcon> </AddIcon>
              Add Items to Inventory
            </Button>
          </Box>

        </DialogActions>
      </Dialog>
      <Box mt={3} textAlign="right">
        <Button
          variant="outlined"
          color="success"
          onClick={handleSaveInvoice}
        >
          Save Invoice
        </Button>
      </Box>
      <Dialog
        open={openAddItem}
        onClose={() => {
          clearItemDialog();
          setOpenAddItem(false);
        }}
        fullWidth
        maxWidth="sm"
      >
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
          <TextField fullWidth type="number" label="Quantity" sx={{ mt: 2 }} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
          <TextField fullWidth type="number" label="Rate" sx={{ mt: 2 }} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
          <TextField fullWidth label="Amount" sx={{ mt: 2 }} value={amount.toFixed(2)} InputProps={{ readOnly: true }} />
          <TextField select fullWidth label="Tax" sx={{ mt: 2 }} value={formState.tax} onChange={(e) => setFormState({ ...formState, tax: e.target.value })}>
            {["5%", "12%", "18%", "28%"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddItem(false)}>Cancel</Button>
          <Button variant="outlined" onClick={handleAddItemToGrid}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}