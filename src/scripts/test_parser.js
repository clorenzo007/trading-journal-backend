import { parseMT5File } from "../utils/mt5Parser.js";
import fs from "fs";

// Mock MT5 CSV data
const csvContent = `Ticket,Open Time,Type,Size,Symbol,Open Price,S / L,T / P,Close Time,Close Price,Commission,Swap,Profit,Comment
50123456,2024.01.01 10:00:00,buy,0.10,EURUSD,1.10000,1.09500,1.11000,2024.01.01 12:00:00,1.10500,0.00,0.00,50.00,Test trade
50123457,2024.01.02 14:30:00,sell,0.20,GBPUSD,1.25000,1.25500,1.24000,2024.01.02 16:00:00,1.25200,0.00,0.00,-40.00,Another test`;

const buffer = Buffer.from(csvContent);

try {
  const trades = parseMT5File(buffer);
  console.log("Parsed Trades:", JSON.stringify(trades, null, 2));
  
  if (trades.length === 2) {
    console.log("✅ Success: Parsed 2 trades.");
    if (trades[0].symbol === "EURUSD" && trades[0].profit_loss === 50) {
      console.log("✅ Data mapping looks correct.");
    } else {
      console.error("❌ Data mapping error.");
    }
  } else {
    console.error(`❌ Expected 2 trades, got ${trades.length}`);
  }
} catch (err) {
  console.error("Error during parsing:", err);
}
