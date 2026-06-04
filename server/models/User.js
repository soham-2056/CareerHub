const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName:         { type: String,  required: true, trim: true },
    email:            { type: String,  required: true, unique: true, lowercase: true, trim: true },
    password:         { type: String,  required: true, minlength: 6 },
    college:          { type: String,  default: "" },
    title:            { type: String,  default: "BTech CSE Student" },
    github:           { type: String,  default: "" },
    linkedin:         { type: String,  default: "" },
    profileImage:     { type: String,  default: "" },
    resumeVisibility: { type: String,  enum: ["public","private"], default: "public" },
    notifications: {
      internshipAlerts: { type: Boolean, default: true },
      jobAlerts:        { type: Boolean, default: true },
      emailAlerts:      { type: Boolean, default: false },
    },
    twoFactorEnabled: { type: Boolean, default: false },
    darkMode:         { type: Boolean, default: false },
    resetPasswordToken:  { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
