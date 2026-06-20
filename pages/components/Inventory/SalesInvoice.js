import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBranches } from "@/store/branchSlice";
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
  Alert, Typography, Container, FormControlLabel, Checkbox
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Autocomplete } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { CleaningServices } from "@mui/icons-material";

export default function SalesInvoice() {
  const dispatch = useDispatch();
  const { branches, loaded, loading } = useSelector((state) => state.branch)

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchBranches())
    }
  })
  const [phone, setPhone] = useState("");


  const commonFieldProps = { size: "small", fullWidth: true };
  const [jazeCustomerDetails, setJazeCustomerDetails] = useState(null);
  // ========== FORM STATE ==========
  const [formState, setFormState] = useState({
    gstType: "",
    cashCredit: "",
    branch: "",
    customer: "",
    email: "",
    date: new Date().toISOString().slice(0, 10),
    // invoiceNo: "",
    refNo: "",
    refDate: "",
    agent: "",
    tax: "",
  });

  // ========== DROPDOWN DATA ==========
  // const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [agents, setAgents] = useState([]);
  const [manualAmount, setManualAmount] = useState("");
  const [isManualAmount, setIsManualAmount] = useState(false);

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
    // axios.get("/api/branch").then(res => setBranches(res.data)).catch(err => console.error(err));
    axios.get("/api/customer").then(res => setCustomers(res.data)).catch(err => console.error(err));
    axios.get("/api/AgentDropDown").
      then(res => setAgents(res.data.data || [])

      ).
      catch(err =>
        console.error(err));

  }, []);

  // Load items when branch changes
  useEffect(() => {
    if (!formState.branch) return;
    axios.get(`/api/item?branch=${formState.branch}`)
      .then(res => setItems(res.data.data || []))
      .catch(err => console.error(err));
  }, [formState.branch]);

  // ================= CALCULATE AMOUNT =================
  // useEffect(() => {
  //   const gstPercentage = parseFloat((formState.tax || "0").replace("%", ""));
  //   const gstAmount = (quantity * rate * gstPercentage) / 100;
  //   setAmount(quantity * rate + gstAmount);
  // }, [quantity, rate, formState.tax]);

  // useEffect(() => {
  //   if (!isManualAmount) {
  //     setAmount(quantity * rate);
  //   }
  // }, [quantity, rate, isManualAmount]);

  useEffect(() => {
    if (!isManualAmount) {
      const gstPercentage = parseFloat(
        (formState.tax || "0").replace("%", "")
      );

      const basic = quantity * rate;
      const gstAmount = (basic * gstPercentage) / 100;

      setAmount(basic + gstAmount);
    }
  }, [
    quantity,
    rate,
    formState.tax,
    isManualAmount,
  ]);
  // ================= DELETE ROW =================
  const handleDeleteRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };
const handleSaveInvoice = async () => {
  if (rows.length === 0) {
    showSnackbar("Add at least one item", "error");
    return;
  }

  if (!formState.branch || !formState.customer) {
    showSnackbar("Please fill customer and branch", "error");
    return;
  }

  try {
    const isJazeUser = !!jazeCustomerDetails;

    const payload = {
      invoiceDate:
        formState.date ||
        new Date().toISOString().slice(0, 10),

      customer: formState.customer,

      // jazeInvoiceNumber: isJazeUser
      //   ? jazeCustomerDetails?.invoiceNumber
      //   : null,

      customerDetails: isJazeUser
        ? {
            customerId: jazeCustomerDetails?.customerId,
            username: jazeCustomerDetails?.username || "",
            custName: jazeCustomerDetails?.custName || "",
            email: jazeCustomerDetails?.email || "",
            phone: jazeCustomerDetails?.phone || "",
            city: jazeCustomerDetails?.city || "",
            location: jazeCustomerDetails?.location || "",
            gst: jazeCustomerDetails?.gst || "",
            company: jazeCustomerDetails?.company || "",
          }
        : null,

      agent: formState.agent || null,
      branch: formState.branch,

      gstType:
        formState.gstType || "TAX_INVOICE",

      paymentMode:
        formState.cashCredit || "CASH",

      items: rows.map((r) => ({
        item: r._id,
        quantity: r.quantity,
        rate: r.rate,
        unit: r.unit || "pcs",
        gstPercentage: r.gstPercentage || 0,
        gstAmount: r.gstAmount || 0,
        total: r.total || 0,
      })),
    };

    const res = await axios.post(
      "/api/salesInvoice",
      payload
    );

    showSnackbar(
      res.data.message || "Invoice saved successfully",
      "success"
    );

    setRows([]);

    setFormState({
      gstType: "",
      cashCredit: "",
      branch: "",
      customer: "",
      email: "",
      date: new Date().toISOString().slice(0, 10),
      refNo: "",
      refDate: "",
      agent: "",
      tax: "",
    });

    setSelectedBranch(null);
    setSelectedItem(null);
    setQuantity(1);
    setRate(0);
    setAmount(0);
    setSelectedUnit("");
    setPhone("");
    setJazeCustomerDetails(null);

  } catch (err) {
    console.error(
      "Error saving invoice:",
      err.response?.data || err.message
    );

    showSnackbar(
      err.response?.data?.message ||
      "Error saving invoice",
      "error"
    );
  }
};
  const handleAddItemToGrid = () => {
    if (!selectedItem) {
      showSnackbar("Please select an item", "error");
      return;
    }

    const gstPercentage = parseFloat((formState.tax || "0").replace("%", ""));
    // const itemTotal = quantity * rate;
    const basicAmount = isManualAmount
      ? amount
      : quantity * rate;

    const gstAmount =
      (basicAmount * gstPercentage) / 100;

    const itemTotal =
      basicAmount + gstAmount;
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
const fetchUserDetails = async (phoneNumber) => {
  if (!phoneNumber) return;

  try {
    const res = await axios.get(
      `/api/jazeApi?type=phone&value=${phoneNumber}`
    );
 
    let responseData = res.data;

    if (responseData?.data) {
      responseData = responseData.data;
    }

    if (!Array.isArray(responseData)) {
      responseData = [responseData];
    }

    const userBlock = responseData.find(
      (item) => item?.User
    );

    if (!userBlock?.User) {
      showSnackbar("User not found", "error");
      return;
    }

    const user = userBlock.User;

    const settingBlock = responseData.find(
      (item) => item?.UserSetting
    );

    const gstNumber =
      settingBlock?.UserSetting?.gstNumber || "";

    const customerObj = {
      _id: String(user.id),
      username: user.username || "",
      custName:
        `${user.name || ""} ${user.last_name || ""}`.trim() ||
        user.username ||
        "Jaze User",
      email: user.email || "",
      phone: user.phone || "",
    };

    setCustomers((prev) => {
      const exists = prev.find(
        (c) => String(c._id) === customerObj._id
      );

      if (exists) return prev;

      return [...prev, customerObj];
    });

    setFormState((prev) => ({
      ...prev,
      customer: customerObj._id,
      email: customerObj.email,
    }));

    setJazeCustomerDetails({
      customerId: customerObj._id,
      username: customerObj.username,
      custName: customerObj.custName,
      phone: customerObj.phone,
      email: customerObj.email,
      city: user.address_city || "",
      location: user.address_line1 || "",
      gst: gstNumber,
      company: user.company_name || "",
      invoiceNumber: user.invoice_number || null,
    });

    showSnackbar("Jaze customer loaded", "success");

  } catch (err) {
    console.error(err);
    showSnackbar("Failed to fetch Jaze user", "error");
  }
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
      {/* <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}> */}
      <Container maxWidth="xl">
        <Grid spacing={8} sx={{ justifyContent: 'center', px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>

          {/* LEFT COLUMN */}
          <Grid item xs={12} sm={12} md={6} lg={6} sx={{ marginBottom: 2 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row", md: 'row' }, gap: 2, height: "100%" }}>

              <TextField
                select
                label="GST Type"
                {...commonFieldProps}
                value={formState.gstType}
                onChange={(e) =>
                  setFormState({ ...formState, gstType: e.target.value })
                }
              >
                <MenuItem value="TAX_INVOICE">Tax Invoice</MenuItem>
                <MenuItem value="REGISTERED">Registered</MenuItem>
                <MenuItem value="COMPOSITION">Composition</MenuItem>
              </TextField>

              <TextField
                select
                label="Cash / Credit"
                {...commonFieldProps}
                value={formState.cashCredit}
                onChange={(e) =>
                  setFormState({ ...formState, cashCredit: e.target.value })
                }
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CREDIT">Credit</MenuItem>
              </TextField>

              <Autocomplete
                {...commonFieldProps}
                options={branches}
                value={selectedBranch}
                onChange={(e, v) => {
                  setSelectedBranch(v);
                  setFormState({ ...formState, branch: v?._id || "" });
                }}
                getOptionLabel={(o) => o?.name || ""}
                isOptionEqualToValue={(o, v) => o._id === v._id}
                renderInput={(params) => (
                  <TextField {...params} label="Branch" {...commonFieldProps} />
                )}
              />


              <Autocomplete
                {...commonFieldProps}
                options={customers}
                value={customers.find(c => c._id === formState.customer) || null}
                onChange={(e, v) =>
                  setFormState({
                    ...formState,
                    customer: v?._id || "",
                    email: v?.email || "",
                  })
                }
                getOptionLabel={(o) =>
                  o?.username
                    ? `${o.username} (${o.custName || ""})`
                    : o?.custName || ""
                }
                isOptionEqualToValue={(o, v) =>
                  String(o._id) === String(v._id)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer"
                    {...commonFieldProps}
                  />
                )}
              />

              <TextField

                label="Email"
                {...commonFieldProps}
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
              /><TextField
                {...commonFieldProps}
                label="Search by Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button

                variant="outlined"
                onClick={() => fetchUserDetails(phone)}
              >
                Search
              </Button>

            </Box>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>

              <TextField
                label="Invoice Date"
                type="date"
                {...commonFieldProps}
                sx={{
                  minWidth: 180,
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)', // 🔥 makes icon white in dark mode
                    cursor: 'pointer',
                  },
                }}
                value={formState.date}
                onChange={(e) =>
                  setFormState({ ...formState, date: e.target.value })
                }
              />

        
              <TextField
                {...commonFieldProps}

                label="Invoice Number"
                value={formState.invoiceNo || "Auto Generated"}
                disabled
              />
              <TextField
                select
                label="Agent"
                {...commonFieldProps}
                value={formState.agent}
                onChange={(e) =>
                  setFormState({ ...formState, agent: e.target.value })
                }
              >
                <MenuItem value="">Select Agent</MenuItem>
                {agents.map((a) => (
                  <MenuItem key={a._id} value={a._id}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ref No"
                {...commonFieldProps}
                value={formState.refNo}
                onChange={(e) =>
                  setFormState({ ...formState, refNo: e.target.value })
                }
              />

              <TextField
                label="Ref Date"
                type="date"
                {...commonFieldProps}
                sx={{
                  minWidth: 180,
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)', // 🔥 makes icon white in dark mode
                    cursor: 'pointer',
                  },
                }}
                InputLabelProps={{ shrink: true }}
                value={formState.refDate}
                onChange={(e) =>
                  setFormState({ ...formState, refDate: e.target.value })
                }
              />
            </Box>
          </Grid>
        </Grid>


      </Container>
      {/* BUTTON */}
      <Box mt={3}>
        <Button variant="outlined" onClick={() => setOpenAddItem(true)} sx={{ float: '' }}>
          <AddIcon> </AddIcon> Add Items to Inventory
        </Button>
      </Box>




      {/* GRID */}
      <Box sx={{ width: "100%", mt: 2 }}>
        <Box sx={{ minWidth: 700 }}>
          <DataGrid
            rows={combinedRows}
            columns={columns}
            getRowId={(row) => row.rowId}
            autoHeight
            pageSize={10}
          />
        </Box>
      </Box>

      {/* TOTALS */}
      <Box
        mt={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        <Typography>Total: ₹ {totals.totalAmount.toFixed(2)}</Typography>
        <Typography>GST: ₹ {totals.totalGST.toFixed(2)}</Typography>
        <Typography>Round Off: ₹ {totals.roundOff.toFixed(2)}</Typography>
      </Box>

      {/* SAVE BUTTON */}
      <Box mt={3}>
        <Button

          variant="contained"
          color="success"
          onClick={handleSaveInvoice}
          style={
            { float: 'right' }
          }
        >
          Save Invoice
        </Button>
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
          {/* <TextField fullWidth label="Amount" sx={{ mt: 2 }}
            value={amount.toFixed(2)}
            InputProps={{ readOnly: true }} /> */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isManualAmount}
                onChange={(e) => {
                  setIsManualAmount(e.target.checked);

                  // restore auto calculation when unchecked
                  if (!e.target.checked) {
                    setAmount(quantity * rate);
                  }
                }}
              />
            }
            label="Manual Amount"
          />

          <TextField
            fullWidth
            type="number"
            label="Amount"
            sx={{ mt: 2 }}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            InputProps={{
              readOnly: !isManualAmount,
            }}
          />
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


    /*  <TextField
                label="Invoice No (Optional)"
                {...commonFieldProps}
                value={formState.invoiceNo}
                onChange={(e) =>
                  setFormState({ ...formState, invoiceNo: e.target.value })
                }
              />
              */