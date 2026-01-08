import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Grid,
  Paper,
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
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

export default function SalesInvoice() {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  const commonFieldProps = { fullWidth: true, size: "small" };

  // ========== FORM STATE ==========
  const [formState, setFormState] = useState({
    gstType: "",
    cashCredit: "",
    branch: "",
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
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [agents, setAgents] = useState([]);

  // ========== SALES INVOICE ROWS ==========
  const [rows, setRows] = useState([]);

  // ========== ADD ITEM MODAL ==========
  const [openAddItem, setOpenAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [amount, setAmount] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState("");

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
    if (!formState.branch) return;
    axios.get(`/api/item?branch=${formState.branch}`)
      .then(res => setItems(res.data.data || []))
      .catch(err => console.error(err));
  }, [formState.branch]);

  // ================= CALCULATE AMOUNT =================
  useEffect(() => {
    const gstPercentage = parseFloat((formState.tax || "0").replace("%", ""));
    const gstAmount = (quantity * rate * gstPercentage) / 100;
    setAmount(quantity * rate + gstAmount);
  }, [quantity, rate, formState.tax]);

  // ================= ADD ITEM TO GRID =================
  // const handleAddItemToGrid = () => {
  //   if (!formState.branch) {
  //     showSnackbar("Please select branch first", "warning");
  //     return;
  //   }
  //   if (!selectedItem || quantity <= 0 || rate <= 0) {
  //     showSnackbar("Please fill all item fields correctly", "error");
  //     return;
  //   }

  //   const item = selectedItem;

  //   if (!item) return;

  //   const gstPercentage = parseFloat((formState.tax || "0").replace("%", ""));
  //   const itemTotal = quantity * rate;
  //   const gstAmount = (itemTotal * gstPercentage) / 100;
  //   const totalWithGST = itemTotal + gstAmount;

  //   setRows([
  //     ...rows,
  //     {
  //       ...item,
  //       quantity,
  //       rate,
  //       total: itemTotal,
  //       gstPercentage,
  //       gstAmount,
  //       totalWithGST,
  //       unit: selectedUnit || item.stockUnit || "pcs",
  //       rowId: Date.now() + Math.random(), // unique row ID
  //     },
  //   ]);

  //   // reset modal fields
  //   setSelectedItem("");
  //   setQuantity(1);
  //   setRate(0);
  //   setAmount(0);
  //   setSelectedUnit("");
  //   setFormState({ ...formState, tax: "" });
  //   setOpenAddItem(false);

  //   showSnackbar("Item added successfully", "success");
  // };

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

    if (!formState.branch || !formState.customer) {
      showSnackbar("Please fill branch, customer", "error");
      return;
    }

    try {
      const payload = {
        invoiceNumber: formState.invoiceNo || undefined,
        invoiceDate: formState.date || new Date().toISOString().slice(0, 10),
        customer: formState.customer,
        branch: formState.branch,
        gstType: formState.gstType || "TAX_INVOICE", // ✅ ADD THIS
        paymentMode: formState.cashCredit || "CASH", // ✅ ADD THIS

        items: rows.map(r => ({
          item: r._id,
          quantity: r.quantity,
          rate: r.rate,
          unit: r.unit || "pcs",
          gstPercentage: r.gstPercentage || 0,
          gstAmount: r.gstAmount || 0,
          total: r.total || 0,
        })),

        totalAmount: rows.reduce((sum, r) => sum + r.total, 0),
        totalGST: rows.reduce((sum, r) => sum + r.gstAmount, 0),
        netAmount: rows.reduce((sum, r) => sum + r.total + r.gstAmount, 0),

        paymentStatus: formState.paymentStatus || "UNPAID",
      };


      await axios.post("/api/salesInvoice", payload);
      showSnackbar("Invoice saved successfully", "success");

      // Reset form for next invoice
      setRows([]);
      setFormState({
        gstType: "",
        cashCredit: "",
        branch: "",
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
      setSelectedBranch(null);
      setSelectedItem("");
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

  setRows(prev => ([
    ...prev,
    {
      ...selectedItem,
      quantity,
      rate,
      total: itemTotal,
      gstPercentage,
      gstAmount,
      totalWithGST: itemTotal + gstAmount,
      unit: selectedItem.stockUnit || "Pcs",
      rowId: Date.now() + Math.random(),
    }
  ]));

  clearItemDialog();
  setOpenAddItem(false);
  showSnackbar("Item added successfully");
};

  // ================= GRID COLUMNS =================
  const columns = [
    { field: "delete", headerName: "Delete", width: 90, renderCell: (params) => <Button color="error" onClick={() => handleDeleteRow(params.row.rowId)}><DeleteIcon /></Button> },
    { field: "itemName", headerName: "Item", width: 150 },
    { field: "itemCode", headerName: "Code", width: 120 },
    { field: "openingStock", headerName: "Stock", width: 120 },
    { field: "quantity", headerName: "Qty", width: 100 },
    { field: "rate", headerName: "Rate", width: 100 },
    { field: "total", headerName: "Subtotal", width: 120 },
    { field: "gstAmount", headerName: "GST", width: 100 },
    { field: "totalWithGST", headerName: "Total", width: 120 },
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
    <>
      <Box sx={{ width: "100%", p: 1, }}>

        <Grid container spacing={2} sx={{ justifyContent: "center" }} >
          {/* Left Column */}
          <Grid item xs={12} sm={6}>


            <TextField
              {...commonFieldProps}
              fullWidth
              select
              label="GST Type"
              value={formState.gstType}
              onChange={(e) =>
                setFormState({ ...formState, gstType: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="TAX_INVOICE">Tax Invoice</MenuItem>
              <MenuItem value="REGISTERED">Registered</MenuItem>
              <MenuItem value="COMPOSITION">Composition</MenuItem>
            </TextField>

            <TextField
              {...commonFieldProps}
              fullWidth
              select
              label="Cash / Credit"
              value={formState.cashCredit}
              onChange={(e) =>
                setFormState({ ...formState, cashCredit: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CREDIT">Credit</MenuItem>
            </TextField>


            <Autocomplete
              options={branches}
              value={selectedBranch}
              onChange={(event, newValue) => {
                setSelectedBranch(newValue);
                setFormState({ ...formState, branch: newValue?._id || "" });
              }}
              getOptionLabel={(o) => o?.name || ""}
              isOptionEqualToValue={(o, v) => o._id === v._id}
              sx={{ mb: 2, minWidth: "100%" }}  // prevent shrinking
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Branch"
                  fullWidth
                  sx={{ minWidth: "100%", boxSizing: "border-box" }}
                />
              )}
            />


            <Autocomplete
              options={customers}
              value={customers.find(c => c._id === formState.customer) || null}
              onChange={(e, newValue) => setFormState({ ...formState, customer: newValue?._id || "", email: newValue?.email || "" })}
              getOptionLabel={o => o?.custName || ""}
              isOptionEqualToValue={(o, v) => o._id === v._id}
              renderInput={(params) => (
                <TextField {...params} {...commonFieldProps} label="Customer" sx={{ mb: 2 }} fullWidth />
              )}
            />

            <TextField
              {...commonFieldProps}
              fullWidth
              label="Email"
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              sx={{ mb: 2 }}
            />

          </Grid>

          {/* Right Column */}
          <Grid item xs={12} sm={6}>
            <TextField
              {...commonFieldProps}
              fullWidth
              label="Invoice Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              {...commonFieldProps}
              fullWidth
              label="Invoice No (Optional)"
              placeholder="Leave empty to auto-generate"
              value={formState.invoiceNo}
              onChange={(e) => setFormState({ ...formState, invoiceNo: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              {...commonFieldProps}
              fullWidth
              select
              label="Agent"
              value={formState.agent}
              onChange={(e) => setFormState({ ...formState, agent: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Select Agent</MenuItem>
              {agents.map(a => (
                <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              {...commonFieldProps}
              fullWidth
              label="Ref No"
              value={formState.refNo}
              onChange={(e) => setFormState({ ...formState, refNo: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              {...commonFieldProps}
              fullWidth
              label="Ref Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formState.refDate}
              onChange={(e) => setFormState({ ...formState, refDate: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>



        <Box mt={3}>
          <Button variant="contained" onClick={() => setOpenAddItem(true)} color="primary">Add Item</Button>
        </Box>

        <Box sx={{ height: 350, width: "100%", mt: 2 }}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.rowId} />
        </Box>

        <Box mt={3}>
          <Button variant="contained" color="success" onClick={handleSaveInvoice}>Save Invoice</Button>
        </Box>
      </Box>

      {/* ========== ADD ITEM MODAL ========== */}
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
            <Button variant="contained" onClick={handleAddItemToGrid}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* ========== SNACKBAR ========== */}
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
        </Snackbar>
      </>
      );
}
