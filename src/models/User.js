import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// ✅ Middleware correcto (sin next)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcryptjs.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcryptjs.compare(candidate, this.password);
};

export default mongoose.model("User", UserSchema);
