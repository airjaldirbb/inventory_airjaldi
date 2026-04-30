import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress,Button } from "@mui/material";
import axios from "axios";
import { exportToExcel } from "@/utils/exportToExcel";

const PurchaseInvoiceRegisterGrid = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); // ✅ Add state for total

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/purchaseInvoiceRegister");
        const bills = res.data.data || [];

        const rowsData = bills.map((bill, index) => ({
          id: bill.id || index,
          invoiceNo: bill.invoiceNo || "",
          invoiceDate: new Date(bill.invoiceDate || bill.date).toLocaleDateString(),
          vendor: bill.vendor?.name || "N/A",
          branch: bill.branch?.name || "N/A",
          itemName: bill.item?.itemName || "N/A",
          qty: Number(bill.qty ?? 0),
          uom: bill.uom || "N/A",
          rate: Number(bill.rate ?? 0),
          taxPercent: Number(bill.taxPercent ?? 0),
          taxAmount: Number(bill.taxAmount ?? 0),
          invoiceAmount: Number(bill.invoiceAmount ?? 0),
        }));

        // ✅ Calculate total amount
        const totalAmount = rowsData.reduce(
          (sum, row) => sum + (row.invoiceAmount || 0),
          0
        );

        setRows(rowsData);
        setTotal(totalAmount); // ✅ Save total
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
    { field: "taxPercent", headerName: "Tax %", width: 100, type: "number" },
    { field: "taxAmount", headerName: "Tax Amt", width: 110, type: "number" },
    { field: "invoiceAmount", headerName: "Invoice Amount", width: 150, type: "number" },
  ];

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
            fileName: "PurchaseRegister.xlsx",
            sheetName: "Purchase Invoice Register",
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
            rowsPerPageOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", mr: 2 }}>
            <strong>Total Amount: </strong>&nbsp; {total.toLocaleString()}
          </Box>
        </>
      )}
    </Box>
    </>
 
  );
};

export default PurchaseInvoiceRegisterGrid;