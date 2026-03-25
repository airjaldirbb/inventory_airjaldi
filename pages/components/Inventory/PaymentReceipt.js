"use client";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Grid,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function PaymentReceiptForm() {
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
      console.log(res, "customre")
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

      const invoiceData = res.data.data || [];

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
        referenceNo: "",
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
    const invalidInvoice = form.invoices.find(
      (inv) => !inv.referenceNo || inv.referenceNo.trim() === ""
    );

    if (invalidInvoice) {
      showSnackbar("Reference No is required for all invoices", "error");
      return;
    }
    const payload = {
      receiptNumber: form.receiptNumber,
      receiptDate: form.receiptDate,
      branch: form.branch,
      customerId: form.customerId,
      customerName: form.customerName,
      totalReceived: form.totalReceived,
      invoices: form.invoices.map((i) => ({
        invoiceId: i.invoiceId,
        invoiceNumber: i.invoiceNumber,
        invoiceDate: i.invoiceDate,
        amountPaid: i.amountPaid,
        referenceNo: i.referenceNo,
        paymentDate: i.paymentDate,
        paymentMode: i.salesPaymentMode, // keep original mode
      })),
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
    <Paper sx={{ p: 4, maxWidth: 1300, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Payment Receipt
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>


        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Receipt Date"
            value={form.receiptDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, receiptDate: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={branches}
            value={selectedBranch}
            onChange={(e, newValue) => {
              setSelectedBranch(newValue);
              setForm((prev) => ({ ...prev, branch: newValue?._id || "" }));
            }}
            getOptionLabel={(o) => o?.name || ""}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            renderInput={(params) => <TextField {...params} label="Branch" />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
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
        </Grid>
      </Grid>

      {/* INVOICE TABLE */}
      {form.invoices.length > 0 && (
        <>
          <Typography sx={{ mt: 3, mb: 1 }}>
            Invoices for {form.customerName}
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer ID</TableCell>
                <TableCell>Invoice No</TableCell>
                <TableCell>Invoice Date</TableCell>
                <TableCell>Payment Mode</TableCell>
                <TableCell>Amount Due</TableCell>
                <TableCell>Reference No</TableCell>
                <TableCell>Amount Paid</TableCell>
                <TableCell>Payment Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {form.invoices.map((i, idx) => (
                <TableRow key={i.invoiceId}>
                  <TableCell>{i.customerId}</TableCell>
                  <TableCell>{i.invoiceNumber}</TableCell>
                  <TableCell>{i.invoiceDate}</TableCell>
                  <TableCell>{i.salesPaymentMode}</TableCell>
                  <TableCell>{i.amountDue}</TableCell>
                  <TableCell>
                    {/* <TextField
                      size="small"
                      value={i.referenceNo}
                      onChange={(e) =>
                        updateInvoiceField(idx, "referenceNo", e.target.value)
                      }
                    /> */}
                    <TextField
                      size="small"
                      value={i.referenceNo}
                      required
                      error={!i.referenceNo}
                      helperText={!i.referenceNo ? "Required" : ""}
                      onChange={(e) =>
                        updateInvoiceField(idx, "referenceNo", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={i.amountPaid}
                      onChange={(e) =>
                        updateInvoiceField(idx, "amountPaid", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="date"
                      size="small"
                      value={i.paymentDate}
                      onChange={(e) =>
                        updateInvoiceField(idx, "paymentDate", e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography sx={{ mt: 2, textAlign: "right", fontWeight: "bold" }}>
            Total Received: ₹{form.totalReceived}
          </Typography>

          <Button variant="contained" sx={{ mt: 2 }} onClick={saveReceipt}>
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
