import * as XLSX from "xlsx";

/**
 * Parses an MT5 report (CSV or XLSX) and returns an array of trade objects.
 * 
 * The parser handles:
 * - Duplicate column names (e.g. "Time" appears for Open and Close).
 * - Various date formats and Excel serial dates.
 * - Number formatting with different separators (comma vs dot).
 * 
 * @param {Buffer} buffer - The file buffer uploaded by the user.
 * @returns {Array} Array of parsed trade objects.
 */
export const parseMT5File = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON array of arrays (header: 1)
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Find the header row (the one containing "Symbol" and either "Ticket" or "Position")
  let headerIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (
      row.includes("Symbol") &&
      (row.includes("Ticket") || row.includes("Position"))
    ) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error("MT5 Parser: Could not find header row");
    return [];
  }

  const header = data[headerIndex];
  const rows = data.slice(headerIndex + 1);

  // Map indices
  const idx = {
    ticket: header.findIndex((c) => c === "Ticket" || c === "Position"),
    symbol: header.indexOf("Symbol"),
    type: header.findIndex((c) => c === "Type"),
    volume: header.findIndex((c) => c === "Volume" || c === "Size"),
    openTime: header.indexOf("Time"), // First occurrence
    openPrice: header.indexOf("Price"), // First occurrence
    sl: header.indexOf("S / L"),
    // Close columns are usually the second occurrence
    closeTime: header.lastIndexOf("Time"),
    closePrice: header.lastIndexOf("Price"),
    profit: header.indexOf("Profit"),
  };

  return rows
    .map((row) => {
      const symbol = row[idx.symbol];
      const openTime = row[idx.openTime];

      if (!symbol || !openTime || symbol === "Symbol") return null;

      // Date parsing (MT5 format is usually YYYY.MM.DD HH:MM:SS)
      const parseDate = (d) => {
        if (!d) return null;
        if (typeof d === "number") {
          // Handle Excel serial date
          return new Date(Math.round((d - 25569) * 864e5));
        }
        // Replace dots with dashes for better JS parsing compatibility
        const sanitized = String(d).replace(/\./g, "-");
        const date = new Date(sanitized);
        return isNaN(date.getTime()) ? null : date;
      };

      const parseNum = (val) => {
        if (val === undefined || val === null || val === "") return 0;
        if (typeof val === "number") return val;
        // Clean the string:
        // 1. Remove non-numeric characters except comma and dot
        // 2. But MT5/Excel might use space as thousands separator (e.g. "4 863,97")
        // 3. And comma as decimal separator.
        let cleaned = String(val).replace(/\s/g, ""); // Remove spaces
        if (cleaned.includes(",") && !cleaned.includes(".")) {
          // Likely European format: 1234,56
          cleaned = cleaned.replace(",", ".");
        } else if (cleaned.includes(",") && cleaned.includes(".")) {
          // Likely US format with thousand separator: 1,234.56
          cleaned = cleaned.replace(/,/g, "");
        }
        return parseFloat(cleaned) || 0;
      };

      const entryDate = parseDate(openTime);
      const exitDate = parseDate(row[idx.closeTime]);

      const profitNum = parseNum(row[idx.profit]);
      let outcome = "Break-even";
      if (profitNum > 0.01) outcome = "Win";
      else if (profitNum < -0.01) outcome = "Loss";

      return {
        symbol: String(symbol).toUpperCase(),
        entry_date: entryDate,
        entry_price: parseNum(row[idx.openPrice]),
        position_size: parseNum(row[idx.volume]),
        stop_loss: parseNum(row[idx.sl]),
        risk_percent: 0,

        exit_date: exitDate,
        exit_price: parseNum(row[idx.closePrice]),
        profit_loss: profitNum,
        outcome: outcome,

        external_id: idx.ticket !== -1 ? String(row[idx.ticket]) : null,
        source: "mt5",
      };
    })
    .filter((trade) => trade !== null && trade.symbol);
};
