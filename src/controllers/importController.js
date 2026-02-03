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

    // ✅ Validar cuenta destino (pertenece al user logeado)
    const account = await TradingAccount.findOne({
      _id: accountId,
      userId: req.user.id,
    });

    if (!account) {
      return res.status(400).json({ error: "Invalid accountId" });
    }

    // TODO: reemplazá esto con tu parser real
    // const rows = await parseMT5File(req.file.path);
    const rows = []; // placeholder: acá va tu data parseada

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of rows) {
      try {
        await Trade.create({
          ...row,
          user: req.user.id, // ✅ consistente con middleware
          account: account._id, // ✅ destino elegido
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
