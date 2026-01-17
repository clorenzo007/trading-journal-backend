import Trade from "../models/Trade.js";
import xlsx from "xlsx";

function normalizeNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}

function normalizeDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export const importMT5 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const wb = xlsx.read(req.file.buffer);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Buscar la fila "Positions"
    let headerIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === "Positions") {
        headerIndex = i + 1;
        break;
      }
    }

    if (headerIndex === -1) {
      return res.status(400).json({ error: "Could not find MT5 header" });
    }

    const dataRows = rows.slice(headerIndex + 1);

    // Índices según tu layout real
    const iEntryTime = 0;
    const iPosition = 1;
    const iSymbol = 2;
    const iType = 3;
    const iVolume = 4;
    const iEntryPrice = 5;
    const iSL = 6;
    const iTP = 7;
    const iExitTime = 8;
    const iExitPrice = 9;
    const iCommission = 10;
    const iSwap = 11;
    const iProfit = 12;

    let imported = 0;
    let skipped = 0;
    let errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      try {
        const entryDate = normalizeDate(r[iEntryTime]);
        const exitDate = normalizeDate(r[iExitTime]);
        const entryPrice = normalizeNumber(r[iEntryPrice]);
        const exitPrice = normalizeNumber(r[iExitPrice]);
        const profit = normalizeNumber(r[iProfit]);

        // Ignorar filas inválidas o trades abiertos
        if (
          !entryDate ||
          !exitDate ||
          entryPrice === null ||
          exitPrice === null
        ) {
          continue;
        }

        const externalId = String(r[iPosition]).trim();
        if (!externalId) continue;

        const exists = await Trade.findOne({
          user: req.user._id,
          external_id: externalId,
        });

        if (exists) {
          skipped++;
          continue;
        }

        await Trade.create({
          user: req.user._id,
          external_id: externalId,
          source: "mt5",

          symbol: r[iSymbol],
          strategy_type: "Imported",
          pattern: "MT5",

          entry_date: entryDate,
          entry_price: entryPrice,

          exit_date: exitDate,
          exit_price: exitPrice,

          stop_loss: normalizeNumber(r[iSL]) || 0,
          position_size: normalizeNumber(r[iVolume]) || 0,

          profit_loss: profit || 0,
          outcome: profit > 0 ? "Win" : profit < 0 ? "Loss" : "Break-even",

          emotional_state_pre: "Imported",
          reason_for_entry: "Imported from MT5",
          risk_percent: 0,
          reviewed: false,
        });

        imported++;
      } catch (e) {
        errors.push(`Row ${headerIndex + i + 2}: ${e.message}`);
      }
    }

    console.log("IMPORT ERRORS:", errors.slice(0, 10));

    res.json({
      imported,
      skipped,
      errors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Import failed" });
  }
};
