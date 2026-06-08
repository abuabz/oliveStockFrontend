import * as xlsx from "xlsx";

export function exportToExcel(data: any[], fileName: string) {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  xlsx.writeFile(wb, `${fileName}.xlsx`);
}
