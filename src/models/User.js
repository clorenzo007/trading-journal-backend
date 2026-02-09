import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ===========================================
    // USER CREDENTIALS
    // ===========================================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ===========================================
    // PERMISSIONS & STATUS
    // ===========================================
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// =========================================================================
// MIDDLEWARE: HASH PASSWORD
// Automatically hashes the password before saving a new or modified user.
// =========================================================================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// =========================================================================
// METHOD: COMPARE PASSWORD
// Compares a candidate password with the hashed password in the database.
// =========================================================================
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
