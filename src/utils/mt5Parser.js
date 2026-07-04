import * as XLSX from "xlsx";

/**
 * Parses a date value from various formats (string or Excel serial number).
 * Formats output into YYYY-MM-DDTHH:mm to preserve local times.
 */
const parseDate = (d) => {
  if (!d) return null;
  if (typeof d === "number") {
    // Handle Excel serial date
    const date = new Date(Math.round((d - 25569) * 864e5));
    if (isNaN(date.getTime())) return null;
    const Y = date.getUTCFullYear();
    const M = String(date.getUTCMonth() + 1).padStart(2, "0");
    const D = String(date.getUTCDate()).padStart(2, "0");
    const H = String(date.getUTCHours()).padStart(2, "0");
    const min = String(date.getUTCMinutes()).padStart(2, "0");
    return `${Y}-${M}-${D}T${H}:${min}`;
  }

  const str = String(d).trim();

  // Try matching YYYY.MM.DD HH:MM or YYYY-MM-DD HH:MM
  const matchClassic = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})[,\s]+(\d{1,2}):(\d{1,2})/);
  if (matchClassic) {
    const year = matchClassic[1];
    const month = matchClassic[2].padStart(2, "0");
    const day = matchClassic[3].padStart(2, "0");
    const hour = matchClassic[4].padStart(2, "0");
    const minute = matchClassic[5].padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  // Try matching M/D/YYYY HH:MM or M-D-YYYY HH:MM
  const matchUS = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})[,\s]+(\d{1,2}):(\d{1,2})/);
  if (matchUS) {
    const month = matchUS[1].padStart(2, "0");
    const day = matchUS[2].padStart(2, "0");
    const year = matchUS[3];
    const hour = matchUS[4].padStart(2, "0");
    const minute = matchUS[5].padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  // Fallback to JS Date parsing
  const date = new Date(str);
  if (isNaN(date.getTime())) return null;
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const H = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${Y}-${M}-${D}T${H}:${min}`;
};

/**
 * Parses an MT5 report (CSV or XLSX) and returns an array of trade objects.
 * 
 * The parser handles:
 * - Classic MT5 report formats and the new spreadsheet format.
 * - Duplicate column names.
 * - Various date formats and Excel serial dates.
 * - Number formatting with different currency indicators and separators.
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

  // Find the header row (the one containing "Symbol" and one of the other columns)
  let headerIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (
      row.includes("Symbol") &&
      (row.includes("Ticket") ||
        row.includes("Position") ||
        row.includes("Type") ||
        row.includes("Open Date"))
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

  const headersLower = header.map((c) => String(c || "").toLowerCase().trim());

  const getIndex = (names) => {
    for (const name of names) {
      const i = headersLower.indexOf(name.toLowerCase());
      if (i !== -1) return i;
    }
    return -1;
  };

  const idx = {
    ticket: getIndex(["ticket", "position", "deal", "id", "order"]),
    symbol: getIndex(["symbol"]),
    type: getIndex(["type"]),
    volume: getIndex(["volume", "size", "lots"]),
    openTime: getIndex(["open date"]),
    openPrice: getIndex(["open"]),
    closeTime: getIndex(["closed date", "close date"]),
    closePrice: getIndex(["closed", "close"]),
    sl: getIndex(["sl", "stop loss", "s / l", "s/l"]),
    tp: getIndex(["tp", "take profit", "t / p", "t/p"]),
    profit: getIndex(["profit", "profit/loss", "gain"]),
  };

  // Fallbacks for duplicate named columns (classic format)
  if (idx.openTime === -1) idx.openTime = headersLower.indexOf("time");
  if (idx.closeTime === -1) idx.closeTime = headersLower.lastIndexOf("time");
  if (idx.openPrice === -1) idx.openPrice = headersLower.indexOf("price");
  if (idx.closePrice === -1) idx.closePrice = headersLower.lastIndexOf("price");

  const parseNum = (val) => {
    if (val === undefined || val === null || val === "") return 0;
    if (typeof val === "number") return val;
    // Clean the string: remove "$" and spaces
    let cleaned = String(val).replace(/\$/g, "").replace(/\s/g, "");
    if (cleaned.includes(",") && !cleaned.includes(".")) {
      cleaned = cleaned.replace(",", ".");
    } else if (cleaned.includes(",") && cleaned.includes(".")) {
      cleaned = cleaned.replace(/,/g, "");
    }
    return parseFloat(cleaned) || 0;
  };

  return rows
    .map((row) => {
      const symbol = idx.symbol !== -1 ? row[idx.symbol] : null;
      const openTime = idx.openTime !== -1 ? row[idx.openTime] : null;

      if (!symbol || !openTime || symbol === "Symbol") return null;

      const entryDate = parseDate(openTime);
      const exitDate = idx.closeTime !== -1 ? parseDate(row[idx.closeTime]) : null;

      const profitNum = idx.profit !== -1 ? parseNum(row[idx.profit]) : 0;
      let outcome = "Break-even";
      if (profitNum > 0.01) outcome = "Win";
      else if (profitNum < -0.01) outcome = "Loss";

      // Map Type (Buy/Sell) to direction (Long/Short)
      let direction = "Long";
      const rawType = idx.type !== -1 ? String(row[idx.type] || "").trim().toLowerCase() : "";
      if (rawType.startsWith("sell") || rawType.startsWith("short")) {
        direction = "Short";
      } else if (rawType.startsWith("buy") || rawType.startsWith("long")) {
        direction = "Long";
      }

      const entryPrice = idx.openPrice !== -1 ? parseNum(row[idx.openPrice]) : 0;
      const exitPrice = idx.closePrice !== -1 ? parseNum(row[idx.closePrice]) : 0;
      const positionSize = idx.volume !== -1 ? parseNum(row[idx.volume]) : 0;

      // Unique hash for duplicate check if no ticket id is available
      let externalId = idx.ticket !== -1 && row[idx.ticket] !== undefined ? String(row[idx.ticket]).trim() : null;
      if (!externalId) {
        externalId = `${String(symbol).toUpperCase()}_${entryDate || ""}_${entryPrice}_${exitDate || ""}_${exitPrice}_${positionSize}`;
      }

      return {
        symbol: String(symbol).toUpperCase(),
        direction,
        entry_date: entryDate,
        entry_price: entryPrice,
        position_size: positionSize,
        stop_loss: idx.sl !== -1 ? parseNum(row[idx.sl]) : 0,
        take_profit: idx.tp !== -1 ? parseNum(row[idx.tp]) : null,
        risk_percent: 0,

        exit_date: exitDate,
        exit_price: exitPrice,
        profit_loss: profitNum,
        outcome: outcome,

        external_id: externalId,
        source: "mt5",
      };
    })
    .filter((trade) => trade !== null && trade.symbol);
};
