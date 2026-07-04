import { parseMT5File } from "../utils/mt5Parser.js";
import * as XLSX from "xlsx";

// 1. Create a mock workbook for the NEW spreadsheet format
const newFormatData = [
  ["Symbol", "Type", "Open Date", "Open", "Closed Date", "Closed", "TP", "SL", "Lots", "Commi", "Profit"],
  ["NDX100", "Buy", "7/2/2026, 10:45", 29885.05, "7/2/2026, 10:51", 29963.58, 29985.49, 29914.03, 0.05, 0.00, 78.53],
  ["NDX100", "Sell", "7/1/2026, 12:20", 30059.00, "7/1/2026, 12:25", 30036.51, 30137.92, 30014.08, 0.05, 0.00, -22.24],
];

const wsNew = XLSX.utils.aoa_to_sheet(newFormatData);
const wbNew = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbNew, wsNew, "Sheet1");
const bufferNew = XLSX.write(wbNew, { type: "buffer", bookType: "xlsx" });

// 2. Create a mock workbook for the CLASSIC MT5 format
const classicFormatData = [
  ["Deal", "Symbol", "Type", "Volume", "Time", "Price", "S / L", "T / P", "Time", "Price", "Profit"],
  ["123456", "EURUSD", "buy", 0.1, "2026.07.01 10:00:00", 1.0850, 1.0800, 1.0900, "2026.07.01 10:15:00", 1.0880, 30.00]
];

const wsClassic = XLSX.utils.aoa_to_sheet(classicFormatData);
const wbClassic = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbClassic, wsClassic, "Sheet1");
const bufferClassic = XLSX.write(wbClassic, { type: "buffer", bookType: "xlsx" });

console.log("=== Testing NEW Spreadsheet Format ===");
const newResult = parseMT5File(bufferNew);
console.log(JSON.stringify(newResult, null, 2));

console.log("\n=== Testing CLASSIC MT5 Format ===");
const classicResult = parseMT5File(bufferClassic);
console.log(JSON.stringify(classicResult, null, 2));
