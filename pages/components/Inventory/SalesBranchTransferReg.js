import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";

const SalesBranchTransferReg = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/SalesBranchTransfer");

      const data = res.data.data.map((item, index) => ({
        id: index + 1,

        invoiceNo: item.invoiceNo,
        invoiceDate: new Date(item.invoiceDate).toLocaleDateString(),

        fromBranch: item.fromBranch || "N/A",
        toBranch: item.toBranch || "N/A",

        itemName: item.itemName || "N/A",

        qty: item.qty,
        uom: item.uom,
        rate: item.rate,

        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount || 0,

        amount: Number(item.amount || 0).toFixed(2),

        status: item.paymentStatus || "UNPAID",
      }));

      setRows(data);
      setTotal(res.data.totalAmount || 0);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= COLUMNS =================
  const columns = [
    { field: "invoiceNo", headerName: "Invoice No", width: 120 },
    { field: "invoiceDate", headerName: "Invoice Date", width: 140 },

    { field: "fromBranch", headerName: "From Branch", width: 180 },
    { field: "toBranch", headerName: "To Branch", width: 180 },

    { field: "itemName", headerName: "Item Name", width: 200 },

    { field: "qty", headerName: "Qty", width: 90 },
    { field: "uom", headerName: "UOM", width: 90 },

    { field: "rate", headerName: "Rate", width: 100 },

    { field: "taxPercent", headerName: "Tax %", width: 90 },
    { field: "taxAmount", headerName: "Tax Amt", width: 110 },

    { field: "amount", headerName: "Amount", width: 120 },

    { field: "status", headerName: "Status", width: 120 },
  ];

  // ================= UI =================
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Sales Branch Transfer Register
      </Typography>

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
              <strong>Total Amount:</strong>&nbsp;
              {Number(total).toLocaleString()}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default SalesBranchTransferReg;