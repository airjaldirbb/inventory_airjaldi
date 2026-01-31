import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { exportToExcel } from "@/utils/exportToExcel";

export default function CustomerTrial() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("/api/customerTrail")
      .then((res) => {
        console.log("API response:", res.data.data); // check your data
        setRows(res.data.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { field: "customerId", headerName: "Customer ID", flex: 1 },
    { field: "customerName", headerName: "Customer Name", flex: 1 },
    // { field: "openingBalance", headerName: "Opening Balance", type: "number", flex: 1 },
    { field: "debit", headerName: "Debit (Sales)", type: "number", flex: 1 },
    { field: "credit", headerName: "Credit (Receipt)", type: "number", flex: 1 },
    { field: "closingBalance", headerName: "Closing Balance", type: "number", flex: 1 },
    { field: "balanceType", headerName: "Balance Type", flex: 1 },
  ];

  return (
    <div style={{ height: 500, width: "100%" }}>
        <Button
        variant="contained"
        color="success"
        sx={{ mb: 2 }}
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
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        getRowId={(row) => row.id} // must match your API "id" field
        autoHeight
        disableSelectionOnClick
      />
    </div>
  );
}
