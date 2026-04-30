"use client";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Snackbar,
  Alert, Box,
  Container,
  Stack
} from "@mui/material";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

export default function PaymentReceiptForm() {
  const commonFieldProps = { size: "small", fullWidth: true };

  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({
    receiptNumber: `RCPT-${Date.now()}`,
    receiptDate: new Date().toISOString().split("T")[0],
    branch: "",
    customerId: "",
    customerName: "",
    invoices: [],
    totalReceived: 0,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    loadBranches();
    loadCustomers();
  }, []);

  const loadBranches = async () => {
    try {
      const res = await axios.get("/api/branch");
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to load branches", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axios.get("/api/customer");
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  // Fetch invoices whenever branch or customer changes
  useEffect(() => {
    fetchInvoices();
  }, [form.branch, form.customerId]);

  const fetchInvoices = async () => {
    if (!form.branch || !form.customerId) {
      setForm((prev) => ({ ...prev, invoices: [], totalReceived: 0 }));
      return;
    }

    try {
      const res = await axios.get("/api/salesInvoice", {
        params: {
          customerId: form.customerId,
          pending: true,
        },
      });

      // const invoiceData = res.data.data || [];

      // ✅ FILTER CREDIT ONLY
      const invoiceData = (res.data.data || []).filter(
        (inv) => inv.paymentMode === "CREDIT"
      );

      if (invoiceData.length === 0) {
        showSnackbar("No CREDIT invoices found", "info");
      }
      if (invoiceData.length === 0) {
        showSnackbar("No invoices found for selected branch/customer", "info");
      }

      const invoiceList = invoiceData.map((inv) => ({
        invoiceId: inv._id,
        customerId: inv.customer?._id || form.customerId,
        customerName: inv.customer?.custName || form.customerName,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: new Date(inv.invoiceDate).toISOString().split("T")[0],
        salesPaymentMode: inv.paymentMode.toUpperCase(),
        amountDue: inv.balanceAmount || inv.netAmount,
        amountPaid: inv.balanceAmount || inv.netAmount,
        // referenceNo: "",
        paymentDate: new Date().toISOString().split("T")[0],
      }));

      setForm((prev) => ({
        ...prev,
        invoices: invoiceList,
        totalReceived: invoiceList.reduce(
          (sum, i) => sum + Number(i.amountPaid),
          0
        ),
      }));
    } catch (err) {
      console.error(err);
      setForm((prev) => ({ ...prev, invoices: [], totalReceived: 0 }));
      showSnackbar("Error fetching invoices", "error");
    }
  };

  const updateInvoiceField = (index, field, value) => {
    const updatedInvoices = [...form.invoices];
    updatedInvoices[index][field] = value;

    setForm((prev) => ({
      ...prev,
      invoices: updatedInvoices,
      totalReceived: updatedInvoices.reduce(
        (sum, i) => sum + Number(i.amountPaid),
        0
      ),
    }));
  };

  const saveReceipt = async () => {
    if (!form.customerId || !form.branch || form.invoices.length === 0) {
      showSnackbar("Customer, Branch, and at least one invoice are required", "warning");
      return;
    }
    // const invalidInvoice = form.invoices.find(
    //   (inv) => !inv.referenceNo || inv.referenceNo.trim() === ""
    // );

    // if (invalidInvoice) {
    //   showSnackbar("Reference No is required for all invoices", "error");
    //   return;
    // }
    // const payload = {
    //   receiptNumber: form.receiptNumber,
    //   receiptDate: form.receiptDate,
    //   branch: form.branch,
    //   customerId: form.customerId,
    //   customerName: form.customerName,
    //   totalReceived: form.totalReceived,
    //   invoices: form.invoices.map((i) => ({
    //     invoiceId: i.invoiceId,
    //     invoiceNumber: i.invoiceNumber,
    //     invoiceDate: i.invoiceDate,
    //     amountPaid: i.amountPaid,
    //     referenceNo: i.referenceNo,
    //     paymentDate: i.paymentDate,
    //     paymentMode: i.salesPaymentMode, // keep original mode
    //   })),
    // };
    const payload = {
      receiptNumber: form.receiptNumber,
      receiptDate: form.receiptDate,
      branch: form.branch,
      customer: form.customerId, // ✅ FIXED KEY

      invoices: form.invoices.map((i) => ({
        invoiceId: i.invoiceId, // must be Mongo _id
        amountPaid: Number(i.amountPaid),
      })),

      totalReceived: Number(form.totalReceived),
    };

    try {
      await axios.post("/api/paymentReceipt", payload);
      showSnackbar("Payment Receipt Saved!", "success");

      // Reset form
      setForm({
        receiptNumber: `RCPT-${Date.now()}`,
        receiptDate: new Date().toISOString().split("T")[0],
        branch: "",
        customerId: "",
        customerName: "",
        invoices: [],
        totalReceived: 0,
      });
      setSelectedBranch(null);
      setSelectedCustomer(null);
    } catch (err) {
      console.error(err);
      showSnackbar("Error saving receipt", "error");
    }
  };

  return (
    <Paper sx={{ p: 5, maxWidth: "auto", mx: "auto", minHeight: "100" }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', margin: '1rem' }}>
        Payment Receipt
      </Typography>


      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
      >
        <TextField
          {...commonFieldProps}
          size="small"
          sx={{
            minWidth: 180,
            '& input::-webkit-calendar-picker-indicator': {
              filter: 'invert(1)', // 🔥 makes icon white in dark mode
              cursor: 'pointer',
            },
          }}
          type="date"
          label="Receipt Date"
          value={form.receiptDate}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, receiptDate: e.target.value }))
          }
          InputLabelProps={{ shrink: true }}
        />

        <Autocomplete
          fullWidth
          {...commonFieldProps}

          sx={{ mb: 2 }}
          options={branches}
          value={selectedBranch}
          onChange={(e, newValue) => {
            setSelectedBranch(newValue);
            setForm((prev) => ({ ...prev, branch: newValue?._id || "" }));
          }}
          getOptionLabel={(o) => o?.name || ""}
          isOptionEqualToValue={(o, v) => o._id === v._id}
          renderInput={(params) => (
            <TextField {...params} label="Branch" />
          )}
        />

        <Autocomplete
          {...commonFieldProps}


          sx={{ mb: 2 }}
          options={customers}
          value={selectedCustomer}
          onChange={(e, newValue) => {
            setSelectedCustomer(newValue);
            setForm((prev) => ({
              ...prev,
              customerId: newValue?._id || "",
              customerName: newValue?.custName || "",
            }));
          }}
          getOptionLabel={(o) => o?.custName || ""}
          isOptionEqualToValue={(o, v) => o._id === v._id}
          renderInput={(params) => (
            <TextField {...params} label="Customer" />
          )}
        />


      </Stack>



      {/* INVOICE TABLE */}


      {form.invoices.length > 0 && (
        <>
          <Typography sx={{ mt: 3, mb: 1 }}>
            Invoices for {form.customerName}
          </Typography>

          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={form.invoices.map((invoice, index) => ({
                id: invoice.invoiceId,
                rowIndex: index,
                ...invoice,
              }))}
              columns={[
                {
                  field: "customerId",
                  headerName: "Customer ID",
                  flex: 1,
                },
                {
                  field: "invoiceNumber",
                  headerName: "Invoice No",
                  flex: 1,
                },
                {
                  field: "invoiceDate",
                  headerName: "Invoice Date",
                  flex: 1,
                },
                {
                  field: "salesPaymentMode",
                  headerName: "Payment Mode",
                  flex: 1,
                },
                {
                  field: "amountDue",
                  headerName: "Amount Due",
                  flex: 1,
                },
                {
                  field: "amountPaid",
                  headerName: "Amount Paid",
                  flex: 1,
                  renderCell: (params) => (
                    <TextField
                      type="number"
                      size="small"
                      value={params.row.amountPaid || ""}
                      onChange={(e) =>
                        updateInvoiceField(
                          params.row.rowIndex,
                          "amountPaid",
                          e.target.value
                        )
                      }
                    />
                  ),
                },
                {
                  field: "paymentDate",
                  headerName: "Payment Date",
                  flex: 1,
                  renderCell: (params) => (
                    <TextField
                      type="date"
                      size="small"
                      value={params.row.paymentDate || ""}
                      onChange={(e) =>
                        updateInvoiceField(
                          params.row.rowIndex,
                          "paymentDate",
                          e.target.value
                        )
                      }
                    />
                  ),
                },
              ]}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
            />
          </Box>

          <Typography sx={{ mt: 2, textAlign: "right", fontWeight: "bold" }}>
            Total Received: ₹{form.totalReceived.toFixed(2)}
          </Typography>

          <Button variant="outlined" sx={{ mt: 2, float: 'right' }} onClick={saveReceipt}>
            Save Payment Receipt
          </Button>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
