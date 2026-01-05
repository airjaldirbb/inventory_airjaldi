import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axios from "axios";

export default function VendorTrial() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("/api/vendorTrial")
      .then((res) => setRows(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { field: "vendorName", headerName: "Vendor Name", flex: 1 },
    // { field: "openingBalance", headerName: "Opening Balance", type: "number", flex: 1 },
    { field: "debit", headerName: "Debit (Payment)", type: "number", flex: 1 },
    { field: "credit", headerName: "Credit (Purchase)", type: "number", flex: 1 },
    { field: "closingBalance", headerName: "Closing Balance", type: "number", flex: 1 },

  ];

  return (
   <div style={{ height: 500, width: "100%" }}>
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
