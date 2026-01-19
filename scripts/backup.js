import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Trade from "../models/Trade.js";

dotenv.config();

const BACKUP_DIR = path.resolve("./backup");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }

  const users = await User.find().lean();
  const trades = await Trade.find().lean();

  fs.writeFileSync(`${BACKUP_DIR}/users.json`, JSON.stringify(users, null, 2));
  fs.writeFileSync(
    `${BACKUP_DIR}/trades.json`,
    JSON.stringify(trades, null, 2),
  );

  console.log("Backup completed:");
  console.log(`- ${users.length} users`);
  console.log(`- ${trades.length} trades`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
