// components/SalesInvoiceRegisterGrid.jsx
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import axios from "axios";

const SalesInvoiceRegister = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({ qty: "", rate: "" });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/salesInvoiceREgister");
      const data = res.data.data.map((item, index) => ({
        id: index + 1,
        parentId: item.parentId,
        itemId: item.itemId,
        transactionType: item.transactionType,
        invoiceNo: item.invoiceNo,
        invoiceDate: new Date(item.invoiceDate).toLocaleDateString(),
        customer:
          item.customer?.username ||
          item.customer?.custName ||
          "N/A",
        branch: item.branch?.name || "N/A",
        itemName: item.item?.itemName || "N/A",
        qty: item.qty,
        uom: item.uom,
        rate: item.rate,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount || 0,
        invoiceAmount: item.invoiceAmount,
        paymentStatus: item.paymentStatus,
      }));

      setRows(data);
      setTotal(res.data.totalAmount || 0);
    } catch (error) {
      console.error(error);
      showSnackbar("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  // ================= EDIT =================
  const handleEditRow = (row) => {
    setEditingRowId(row.id);
    setEditValues({
      qty: row.qty,
      rate: row.rate,
    });
  };

  const handleUpdateRow = async (row) => {
    try {
      await axios.put(
        `/api/salesInvoiceREgister?id=${row.parentId}&type=SALE&itemId=${row.itemId}`,
        {
          qty: Number(editValues.qty),
          rate: Number(editValues.rate),
          itemName: editValues.itemName,
        }
      );

      // ✅ update UI
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
              ...r,
              qty: Number(editValues.qty),
              rate: Number(editValues.rate),
              item: {
                ...r.item,
                itemName: editValues.itemName,
              },
              invoiceAmount:
                Number(editValues.qty) * Number(editValues.rate),
            }
            : r
        )
      );

      setEditingRowId(null);
      showSnackbar("Updated successfully", "success");
      fetchData(); // optional

    } catch (err) {
      console.error(err);
      showSnackbar("Update failed", "error");
    }
  };

  // ================= DELETE =================
  const handleDeleteRow = async (row) => {
    try {
      await axios.delete("/api/salesInvoiceREgister", {
        data: {
          parentId: row.parentId,
          itemId: row.itemId,
          transactionType: row.transactionType,
        },
      });

      setRows((prev) => prev.filter((r) => r.id !== row.id));
      showSnackbar("Deleted successfully", "success");

      // optional refresh
      fetchData();

    } catch (err) {
      console.error(err);
      showSnackbar("Delete failed", "error");
    }
  };

  // ================= COLUMNS =================
  const columns = [
    { field: "invoiceNo", headerName: "Invoice No", width: 120 },
    { field: "invoiceDate", headerName: "Invoice Date", width: 130 },
    { field: "customer", headerName: "Customer", width: 150 },
    { field: "branch", headerName: "Branch", width: 120 },
    { field: "itemName", headerName: "Item Name", width: 150 },
    {
      field: "qty",
      headerName: "Qty",
      width: 100,
      renderCell: (params) =>
        editingRowId === params.row.id ? (
          <TextField
            size="small"
            type="number"
            value={editValues.qty}
            onChange={(e) =>
              setEditValues({ ...editValues, qty: e.target.value })
            }
          />
        ) : (
          params.value
        ),
    },
    { field: "uom", headerName: "UOM", width: 80 },
    {
      field: "rate",
      headerName: "Rate",
      width: 100,
      renderCell: (params) =>
        editingRowId === params.row.id ? (
          <TextField
            size="small"
            type="number"
            value={editValues.rate}
            onChange={(e) =>
              setEditValues({ ...editValues, rate: e.target.value })
            }
          />
        ) : (
          params.value
        ),
    },
    { field: "taxPercent", headerName: "Tax %", width: 80 },
    { field: "taxAmount", headerName: "Tax Amt", width: 100 },
    {
      field: "invoiceAmount",
      headerName: "Amount",
      width: 120,
      renderCell: (params) => {
        const rate = Number(params.row.rate || 0);
        const taxAmount = Number(params.row.taxAmount || 0);

        const amount = rate + taxAmount;

        return Math.abs(Number(amount.toFixed(2)));
      },
    },
    { field: "paymentStatus", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        const isEditing = editingRowId === params.row.id;

        return (
          <>
            {isEditing ? (
              <Button
                size="small"
                color="success"
                onClick={() => handleUpdateRow(params.row)}
              >
                Save
              </Button>
            ) : (
              <Button size="small" onClick={() => handleEditRow(params.row)}>
                Edit
              </Button>
            )}

            <Button
              size="small"
              color="error"
              onClick={() => handleDeleteRow(params.row)}
            >
              Delete
            </Button>
          </>
        );
      },
    },
  ];

  // ================= UI =================
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          color="success"
          onClick={() =>
            exportToExcel({
              fileName: "customer-trial.xlsx",
              sheetName: "Customer Trial",
              columns,
              rows,
            })
          }
        >
          Export Excel
        </Button>
      </Box>
      <Box sx={{ height: 500, width: "100%" }}>

        {loading ? (
          <CircularProgress />
        ) : (
          <>

            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableRowSelectionOnClick
            />

            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
                mr: 2,
              }}
            >
              <strong>Total Amount:</strong>&nbsp; {total.toLocaleString()}
            </Box>
          </>
        )}
      </Box>


      {/* Snackbar */}
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

    </>
  );
};

export default SalesInvoiceRegister;