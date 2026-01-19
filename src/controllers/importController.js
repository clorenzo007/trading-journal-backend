import Trade from "../models/Trade.js";

// Asume que ya tenés la lógica de parseo del archivo (CSV/XLSX) en alguna función
// Ejemplo: parseMT5File(filePath) -> devuelve array de trades

export const importMT5 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const account = req.account; // viene del middleware
    const user = req.user;

    // TODO: reemplazá esto con tu parser real
    // const rows = await parseMT5File(req.file.path);

    const rows = []; // placeholder: acá va tu data parseada

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of rows) {
      try {
        // Ajustá los campos según tu estructura real
        await Trade.create({
          ...row,
          user: user._id,
          account: account._id,
          source: "mt5",
        });

        imported++;
      } catch (err) {
        skipped++;
        errors.push(err.message);
      }
    }

    res.json({
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
    res.status(500).json({ error: "Import failed" });
  }
};
