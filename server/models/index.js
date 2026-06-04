const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

// ─── User ─────────────────────────────────────────────────────────────────────
const User = sequelize.define("User", {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName:         { type: DataTypes.STRING(120), allowNull: false },
  email:            { type: DataTypes.STRING(200), allowNull: false, unique: true,
                      set(val) { this.setDataValue("email", val.toLowerCase().trim()); } },
  password:         { type: DataTypes.STRING(255), allowNull: false },
  college:          { type: DataTypes.STRING(200), defaultValue: "" },
  title:            { type: DataTypes.STRING(120), defaultValue: "BTech CSE Student" },
  github:           { type: DataTypes.STRING(300), defaultValue: "" },
  linkedin:         { type: DataTypes.STRING(300), defaultValue: "" },
  profileImage:     { type: DataTypes.TEXT,        defaultValue: "" },
  resumeVisibility: { type: DataTypes.ENUM("public","private"), defaultValue: "public" },
  // Notification flags stored as separate booleans
  notifInternship:  { type: DataTypes.BOOLEAN, defaultValue: true },
  notifJob:         { type: DataTypes.BOOLEAN, defaultValue: true },
  notifEmail:       { type: DataTypes.BOOLEAN, defaultValue: false },
  twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  darkMode:         { type: DataTypes.BOOLEAN, defaultValue: false },
  resetToken:       { type: DataTypes.STRING(255), allowNull: true },
  resetTokenExpire: { type: DataTypes.DATE,        allowNull: true },
}, {
  tableName:  "users",
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed("password")) {
        const salt    = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

User.prototype.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

User.prototype.toPublic = function () {
  return {
    id:               this.id,
    fullName:         this.fullName,
    email:            this.email,
    college:          this.college,
    title:            this.title,
    github:           this.github,
    linkedin:         this.linkedin,
    profileImage:     this.profileImage,
    resumeVisibility: this.resumeVisibility,
    darkMode:         this.darkMode,
    notifications: {
      internshipAlerts: this.notifInternship,
      jobAlerts:        this.notifJob,
      emailAlerts:      this.notifEmail,
    },
    twoFactorEnabled: this.twoFactorEnabled,
    createdAt:        this.createdAt,
  };
};

// ─── RefreshToken ─────────────────────────────────────────────────────────────
const RefreshToken = sequelize.define("RefreshToken", {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:      { type: DataTypes.INTEGER, allowNull: false },
  token:       { type: DataTypes.STRING(100), allowNull: false, unique: true },
  family:      { type: DataTypes.STRING(50),  allowNull: false },
  isRevoked:   { type: DataTypes.BOOLEAN, defaultValue: false },
  expiresAt:   { type: DataTypes.DATE,    allowNull: false },
  createdByIp: { type: DataTypes.STRING(60), defaultValue: "" },
}, { tableName: "refresh_tokens", timestamps: true });

// ─── Skill ────────────────────────────────────────────────────────────────────
const Skill = sequelize.define("Skill", {
  id:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name:   { type: DataTypes.STRING(100), allowNull: false },
  level:  { type: DataTypes.ENUM("Beginner","Intermediate","Advanced"), defaultValue: "Beginner" },
}, { tableName: "skills", timestamps: true });

// ─── Internship ───────────────────────────────────────────────────────────────
const Internship = sequelize.define("Internship", {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  company:     { type: DataTypes.STRING(200), allowNull: false },
  location:    { type: DataTypes.STRING(200), defaultValue: "Remote" },
  type:        { type: DataTypes.ENUM("Remote","Hybrid","On-site"), defaultValue: "Remote" },
  duration:    { type: DataTypes.STRING(100), defaultValue: "3 months" },
  stipend:     { type: DataTypes.STRING(100), defaultValue: "Unpaid" },
  category:    { type: DataTypes.ENUM("frontend","backend","fullstack","java","python","uiux","data"), allowNull: false },
  skills:      { type: DataTypes.TEXT, defaultValue: "",
                 get() { const v = this.getDataValue("skills"); return v ? v.split(",") : []; },
                 set(arr) { this.setDataValue("skills", Array.isArray(arr) ? arr.join(",") : arr); } },
  description: { type: DataTypes.TEXT, defaultValue: "" },
  applyLink:   { type: DataTypes.STRING(500), defaultValue: "" },
  deadline:    { type: DataTypes.DATE, allowNull: true },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "internships", timestamps: true });

// ─── Application ──────────────────────────────────────────────────────────────
const Application = sequelize.define("Application", {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:       { type: DataTypes.INTEGER, allowNull: false },
  internshipId: { type: DataTypes.INTEGER, allowNull: false },
  status:       { type: DataTypes.ENUM("applied","shortlisted","rejected","accepted"), defaultValue: "applied" },
  appliedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "applications",
  timestamps: true,
  indexes: [{ unique: true, fields: ["userId","internshipId"] }],
});

// ─── Resume ───────────────────────────────────────────────────────────────────
const Resume = sequelize.define("Resume", {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:      { type: DataTypes.INTEGER, allowNull: false, unique: true },
  fileName:    { type: DataTypes.STRING(300), defaultValue: "" },
  filePath:    { type: DataTypes.STRING(500), defaultValue: "" },
  score:       { type: DataTypes.INTEGER, defaultValue: 0 },
  skills:      { type: DataTypes.TEXT, defaultValue: "",
                 get() { const v = this.getDataValue("skills"); return v ? v.split(",") : []; },
                 set(arr) { this.setDataValue("skills", Array.isArray(arr) ? arr.join(",") : arr); } },
  suggestions: { type: DataTypes.TEXT, defaultValue: "",
                 get() { const v = this.getDataValue("suggestions"); try { return v ? JSON.parse(v) : []; } catch { return []; } },
                 set(arr) { this.setDataValue("suggestions", JSON.stringify(arr)); } },
  aiAnalysis:  { type: DataTypes.TEXT, defaultValue: "" },
}, { tableName: "resumes", timestamps: true });

// ─── Associations ─────────────────────────────────────────────────────────────
User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Skill,        { foreignKey: "userId", onDelete: "CASCADE" });
Skill.belongsTo(User,      { foreignKey: "userId" });

User.hasMany(Application,  { foreignKey: "userId", onDelete: "CASCADE" });
Application.belongsTo(User,       { foreignKey: "userId" });
Application.belongsTo(Internship, { foreignKey: "internshipId" });
Internship.hasMany(Application,   { foreignKey: "internshipId" });

User.hasOne(Resume,   { foreignKey: "userId", onDelete: "CASCADE" });
Resume.belongsTo(User, { foreignKey: "userId" });

module.exports = { sequelize, User, RefreshToken, Skill, Internship, Application, Resume };
