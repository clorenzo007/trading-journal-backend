import Trade from "../models/Trade.js";
import { parseMT5File } from "../utils/mt5Parser.js";

export const importMT5 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // req.account is populated by requireActiveAccount middleware
    const account = req.account;

    if (!account) {
      return res.status(400).json({ error: "No active account" });
    }

    // Parse the file (using the memory buffer)
    const rows = parseMT5File(req.file.buffer);

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of rows) {
      try {
        // Check for duplicates based on external_id and account
        if (row.external_id) {
          const existing = await Trade.findOne({
            external_id: row.external_id,
            account: account._id,
          });
          if (existing) {
            skipped++;
            continue;
          }
        }

        await Trade.create({
          user: req.user.id,
          account: account._id,

          symbol: row.symbol,
          entry_date: row.entry_date,
          entry_price: row.entry_price,
          position_size: row.position_size,
          stop_loss: row.stop_loss,
          risk_percent: row.risk_percent || 0,

          exit_date: row.exit_date,
          exit_price: row.exit_price,
          profit_loss: row.profit_loss,
          outcome: row.outcome,

          external_id: row.external_id,
          source: "mt5",
          strategy_type: "MT5 Import",
          pattern: "N/A",
        });

        imported++;
      } catch (err) {
        errors.push(`Error in row ${row.external_id || "unknown"}: ${err.message}`);
      }
    }

    return res.json({
      imported,
      skipped,
      errors,
      account: {
        id: account._id,
        name: account.name,
      },
    });
  } catch (err) {
    console.error("IMPORT MT5 ERROR:", err);
    return res.status(500).json({ error: "Import failed" });
  }
};
