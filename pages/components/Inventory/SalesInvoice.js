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
  Alert, Typography, Container
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Autocomplete } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

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
    invoiceNo: "",
    refNo: "",
    refDate: "",
    agent: "",
    tax: "",
    paymentStatus: "UNPAID",
  });

  // ========== DROPDOWN DATA ==========
  // const [branches, setBranches] = useState([]);
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
    // axios.get("/api/branch").then(res => setBranches(res.data)).catch(err => console.error(err));
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


  // ================= DELETE ROW =================
  const handleDeleteRow = (rowId) => {
    setRows(rows.filter(r => r.rowId !== rowId));
  };
  // ================= SAVE INVOICE =================
  // const handleSaveInvoice = async () => {
  //   if (rows.length === 0) {
  //     showSnackbar("Add at least one item to save invoice", "error");
  //     return;
  //   }

  //   if (!formState.branch || !formState.customer) {
  //     showSnackbar("Please fill branch, customer", "error");
  //     return;
  //   }

  //   try {
  //     const payload = {
  //       invoiceNumber: formState.invoiceNo || undefined,
  //       invoiceDate: formState.date || new Date().toISOString().slice(0, 10),
  //       customer: formState.customer,
  //         customerDetails: jazeCustomerDetails || null,

  //       // ✅ ADD THIS
  //       agent: formState.agent || null,
  //       branch: formState.branch,
  //       gstType: formState.gstType || "TAX_INVOICE", // ✅ ADD THIS
  //       paymentMode: formState.cashCredit || "CASH", // ✅ ADD THIS

  //       items: rows.map(r => ({
  //         item: r._id,
  //         quantity: r.quantity,
  //         rate: r.rate,
  //         unit: r.unit || "pcs",
  //         gstPercentage: r.gstPercentage || 0,
  //         gstAmount: r.gstAmount || 0,
  //         total: r.total || 0,
  //       })),

  //       totalAmount: totals.totalAmount,
  //       totalGST: totals.totalGST,
  //       netAmount: totals.roundedNetAmount,
  //       roundOff: totals.roundOff,
  //       totalAmount: rows.reduce((sum, r) => sum + r.total, 0),
  //       totalGST: rows.reduce((sum, r) => sum + r.gstAmount, 0),
  //       netAmount: rows.reduce((sum, r) => sum + r.total + r.gstAmount, 0),
  //       paymentStatus: formState.paymentStatus || "UNPAID",
  //     };
  //     await axios.post("/api/salesInvoice", payload);
  //     console.log(payload,"customer name")
  //     showSnackbar("Invoice saved successfully", "success");

  //     setRows([]);
  //     setFormState({
  //       gstType: "",
  //       cashCredit: "",
  //       branch: "",
  //       customer: "",
  //       email: "",
  //       date: new Date().toISOString().slice(0, 10),
  //       invoiceNo: "",
  //       refNo: "",
  //       refDate: "",
  //       agent: "",
  //       tax: "",
  //       paymentStatus: "UNPAID",
  //     });
  //     setSelectedBranch(null);
  //     setSelectedItem("");
  //     setQuantity(1);
  //     setRate(0);
  //     setAmount(0);
  //     setSelectedUnit("");
  //   } catch (err) {
  //     console.error("Error saving invoice:", err.response?.data || err.message);
  //     showSnackbar("Error saving invoice", "error");
  //   }
  // };
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
      // 🔥 detect if selected customer is Jaze user
      const selectedCustomer = customers.find(
        (c) => String(c._id) === String(formState.customer)
      );

      const isJazeUser =
        selectedCustomer &&
        !String(formState.customer).match(/^[0-9a-fA-F]{24}$/);

      const payload = {
        invoiceNumber: formState.invoiceNo || undefined,

        invoiceDate:
          formState.date ||
          new Date().toISOString().slice(0, 10),

        customer: formState.customer,

        // 🔥 send only for Jaze user
        customerDetails: isJazeUser
          ? {
            customerId: jazeCustomerDetails?.customerId,
            username:
              jazeCustomerDetails?.username ||
              selectedCustomer?.username ||
              "",

            custName:
              jazeCustomerDetails?.custName ||
              selectedCustomer?.custName ||
              "",

            email:
              jazeCustomerDetails?.email ||
              selectedCustomer?.email ||
              "",

            phone:
              jazeCustomerDetails?.phone ||
              selectedCustomer?.phone ||
              "",

            city:
              jazeCustomerDetails?.city || "",

            location:
              jazeCustomerDetails?.location || "",

            gst:
              jazeCustomerDetails?.gst || "",

            company:
              jazeCustomerDetails?.company || "",
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
          gstPercentage:
            r.gstPercentage || 0,
          gstAmount:
            r.gstAmount || 0,
          total: r.total || 0,
        })),

        totalAmount: rows.reduce(
          (sum, r) => sum + Number(r.total || 0),
          0
        ),

        totalGST: rows.reduce(
          (sum, r) =>
            sum + Number(r.gstAmount || 0),
          0
        ),

        netAmount: rows.reduce(
          (sum, r) =>
            sum +
            Number(r.total || 0) +
            Number(r.gstAmount || 0),
          0
        ),

        paymentStatus:
          formState.paymentStatus ||
          "UNPAID",
      };

      console.log(payload, "FINAL PAYLOAD");

      await axios.post(
        "/api/salesInvoice",
        payload
      );

      showSnackbar(
        "Invoice saved successfully",
        "success"
      );

      setRows([]);

      setFormState({
        gstType: "",
        cashCredit: "",
        branch: "",
        customer: "",
        email: "",
        date: new Date()
          .toISOString()
          .slice(0, 10),
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
      console.error(
        "Error saving invoice:",
        err.response?.data || err.message
      );

      showSnackbar(
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
  // const fetchUserDetails = async (phoneNumber) => {
  //   if (!phoneNumber) return;

  //   try {
  //     const res = await axios.get(
  //       `/api/jazeApi?type=phone&value=${phoneNumber}`
  //     );

  //     let responseData = res.data;
  //     console.log(responseData)
  //     if (responseData?.data) {
  //       responseData = responseData.data;
  //     }

  //     if (!Array.isArray(responseData)) {
  //       responseData = [responseData];
  //     }

  //     const userBlock = responseData.find(
  //       (item) => item?.User
  //     );

  //     if (!userBlock?.User) {
  //       console.warn("User not found");
  //       return;
  //     }

  //     const user = userBlock.User;
  //     const gstNumber =
  //       userBlock.UserSetting?.gstNumber || "";

  //     const customerObj = {
  //       _id: String(user.id),
  //       username: user.username || "",
  //       custName: `${user.name || ""} ${user.last_name || ""}`.trim(),
  //       email: user.email || "",
  //       phone: user.phone || "",
  //     };

  //     // Add in dropdown list
  //     setCustomers((prev) => {
  //       const exists = prev.find(
  //         (c) =>
  //           String(c._id) === customerObj._id
  //       );

  //       if (exists) return prev;

  //       return [...prev, customerObj];
  //     });

  //     // Select customer
  //     setFormState((prev) => ({
  //       ...prev,
  //       customer: customerObj._id,
  //       email: customerObj.email,
  //     }));

  //     // Store extra details
  //     setJazeCustomerDetails({
  //       customerId: customerObj._id,
  //       username: customerObj.username,
  //       custName: customerObj.custName,
  //       phone: user.phone || "",
  //       email: user.email || "",
  //       city: user.address_city || "",
  //       location: user.address_line1 || "",
  //       gst: gstNumber,
  //       company: user.company_name || "",
  //     });

  //     console.log(
  //       "✅ Jaze customer set successfully",
  //       customerObj._id
  //     );

  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const fetchUserDetails = async (phoneNumber) => {
    if (!phoneNumber) return;

    try {
      const res = await axios.get(
        `/api/jazeApi?type=phone&value=${phoneNumber}`
      );

      let responseData = res.data;
console.log(responseData,"data ")
      // if wrapped in { data: [...] }
      if (responseData?.data) {
        responseData = responseData.data;
      }

      // always make array
      if (!Array.isArray(responseData)) {
        responseData = [responseData];
      }

      // find block which contains User object
      const userBlock = responseData.find(
        (item) => item?.User
      );

      if (!userBlock?.User) {
        console.warn("User not found");
        return;
      }

      const user = userBlock.User;

      // find UserSetting block separately
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

      // dropdown add
      setCustomers((prev) => {
        const exists = prev.find(
          (c) => String(c._id) === customerObj._id
        );

        if (exists) return prev;

        return [...prev, customerObj];
      });

      // select customer
      setFormState((prev) => ({
        ...prev,
        customer: customerObj._id,
        email: customerObj.email,
      }));

      // backend save payload
      setJazeCustomerDetails({
        customerId: customerObj._id,
        username: customerObj.username, // testing1
        custName: customerObj.custName, // office test
        phone: customerObj.phone,
        email: customerObj.email,
        city: user.address_city || "",
        location: user.address_line1 || "",
        gst: gstNumber,
        company: user.company_name || "",
      });

      console.log("✅ Jaze customer set:", customerObj);

    } catch (err) {
      console.error(err);
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
                label="Invoice No (Optional)"
                {...commonFieldProps}
                value={formState.invoiceNo}
                onChange={(e) =>
                  setFormState({ ...formState, invoiceNo: e.target.value })
                }
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
