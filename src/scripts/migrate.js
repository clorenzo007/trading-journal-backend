import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import Trade from "../models/Trade.js";
import Account from "../models/Account.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find();

  console.log(`Found ${users.length} users`);

  for (const user of users) {
    let account = await Account.findOne({
      user: user._id,
      name: "Default Account",
    });

    if (!account) {
      account = await Account.create({
        user: user._id,
        name: "Default Account",
        provider: "Unknown",
        accountType: "real",
        accountNumber: "N/A",
        initialBalance: 0,
      });

      console.log(`Created default account for user ${user.email}`);
    }

    const trades = await Trade.find({ user: user._id });

    for (const trade of trades) {
      if (!trade.account) {
        trade.account = account._id;
        await trade.save();
      }
    }

    console.log(`Migrated ${trades.length} trades for ${user.email}`);
  }

  console.log("Migration completed.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
