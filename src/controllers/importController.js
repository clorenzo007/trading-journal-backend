import Trade from "../models/Trade.js";
import TradingAccount from "../models/TradingAccount.js";

export const importMT5 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "accountId is required" });
    }

    const account = await TradingAccount.findOne({
      _id: accountId,
      userId: req.user.id,
    });

    if (!account) {
      return res.status(400).json({ error: "Invalid accountId" });
    }

    // 🔧 TODO: reemplazar por parser real MT5
    // const rows = await parseMT5File(req.file.path);
    const rows = []; // placeholder

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of rows) {
      try {
        await Trade.create({
          user: req.user.id,
          account: account._id,

          symbol: row.symbol,
          entry_date: row.entry_date,
          entry_price: row.entry_price,
          position_size: row.position_size,
          stop_loss: row.stop_loss,
          risk_percent: row.risk_percent,

          exit_date: row.exit_date || null,
          exit_price: row.exit_price || null,
          profit_loss: row.profit_loss || null,
          outcome: row.outcome || null,

          external_id: row.ticket,
          source: "mt5",
        });

        imported++;
      } catch (err) {
        skipped++;
        errors.push(err.message);
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
