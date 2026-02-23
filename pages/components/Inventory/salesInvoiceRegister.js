// components/SalesInvoiceRegisterGrid.jsx
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";

const SalesInvoiceRegister = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
const [total, setTotal] = useState(0);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/salesInvoiceREgister"); // fix API path

      const data = res.data.data.map((item, index) => ({
        id: index + 1,
        invoiceNo: item.invoiceNo,
        invoiceDate: new Date(item.invoiceDate).toLocaleDateString(),
        customer: item.customer?.name || "N/A",
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
      setTotal(res.data.totalAmount || 0); // set total
    } catch (error) {
      console.error("Error fetching sales invoice register data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const columns = [
    { field: "invoiceNo", headerName: "Invoice No", width: 120 },
    { field: "invoiceDate", headerName: "Invoice Date", width: 130 },
    { field: "customer", headerName: "Customer", width: 150 },
    { field: "branch", headerName: "Branch", width: 120 },
    { field: "itemName", headerName: "Item Name", width: 150 },
    { field: "qty", headerName: "Qty", width: 80, type: "number" },
    { field: "uom", headerName: "UOM", width: 80 },
    { field: "rate", headerName: "Rate", width: 100, type: "number" },
    { field: "taxPercent", headerName: "Tax %", width: 80, type: "number" },
    { field: "taxAmount", headerName: "Tax Amt", width: 100, type: "number" },
    {
      field: "invoiceAmount",
      headerName: "Invoice Amount",
      width: 140,
      type: "number",
    },
    { field: "paymentStatus", headerName: "Payment Status", width: 140 },
  ];

  return (
<Box sx={{ height: 500, width: "100%" }}>
  {loading ? (
    <CircularProgress />
  ) : (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", mr: 2 }}>
        <strong>Total Amount: </strong>&nbsp; {total.toLocaleString()}
      </Box>
    </>
  )}
</Box>
  );
};

export default SalesInvoiceRegister;
