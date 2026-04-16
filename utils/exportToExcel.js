import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = ({
  fileName = "report.xlsx",
  sheetName = "Sheet1",
  columns = [],
  rows = [],
}) => {
  // Prepare header
  const header = columns.map((col) => col.headerName);

  // Prepare data rows
  const data = rows.map((row) =>
    columns.map((col) => row[col.field] ?? "")
  );

  // Combine header + rows
  const worksheetData = [header, ...data];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob(
    [excelBuffer],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  );

  saveAs(blob, fileName);
};
