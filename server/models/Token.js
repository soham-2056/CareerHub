const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token:       { type: String, required: true, unique: true },
    family:      { type: String, required: true },
    isRevoked:   { type: Boolean, default: false },
    expiresAt:   { type: Date,   required: true },
    createdByIp: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-delete expired tokens via MongoDB TTL index
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Token", tokenSchema);
