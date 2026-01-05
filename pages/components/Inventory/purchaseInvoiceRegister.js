import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";

const PurchaseInvoiceRegisterGrid = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/purchaseInvoiceRegister");
        const bills = res.data.data || [];

        // Flatten API response for DataGrid
        const rowsData = bills.map((bill, index) => ({
          id: bill.id || index, // unique ID
          invoiceNo: bill.invoiceNo || "",
          invoiceDate: new Date(bill.invoiceDate || bill.date).toLocaleDateString(),
          vendor: bill.vendor?.name || "N/A",
          branch: bill.branch?.name || "N/A",
          itemName: bill.item?.itemName || "N/A",
          qty: Number(bill.qty ?? 0),
          uom: bill.uom || "N/A",
          rate: Number(bill.rate ?? 0),
          taxPercent: Number(bill.taxPercent ?? 0), // <-- THIS WILL NOW WORK
            taxPercent: bill.taxPercent != null ? bill.taxPercent : 0, // number
          taxAmount: Number(bill.taxAmount ?? 0),
          invoiceAmount: Number(bill.invoiceAmount ?? 0),
        }));

        console.log("RowsData:", rowsData); // check values here
        setRows(rowsData);
      } catch (error) {
        console.error("Error fetching purchase invoice register:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: "invoiceNo", headerName: "Purchase Invoice No", width: 160 },
    { field: "invoiceDate", headerName: "Invoice Date", width: 130 },
    { field: "vendor", headerName: "Vendor Name", width: 180 },
    { field: "branch", headerName: "Branch", width: 180 },
    { field: "itemName", headerName: "Item Name", width: 160 },
    { field: "qty", headerName: "Qty", width: 80, type: "number" },
    { field: "uom", headerName: "UOM", width: 80 },
    { field: "rate", headerName: "Rate", width: 110, type: "number" },
    {
      field: "taxPercent",
      headerName: "Tax %",
      width: 100,
      type: "number",
      // valueFormatter: (params) => `${params.value}%`, // display 5 as "5%"
    },
    { field: "taxAmount", headerName: "Tax Amt", width: 110, type: "number" },
    { field: "invoiceAmount", headerName: "Invoice Amount", width: 150, type: "number" },
  ];

  return (
    <Box sx={{ height: 520, width: "100%" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
        />
      )}
    </Box>
  );
};

export default PurchaseInvoiceRegisterGrid;
