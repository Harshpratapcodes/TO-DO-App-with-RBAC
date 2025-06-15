const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const Role = sequelize.define("Role", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        allowNull: false,
        primaryKey: true
    },
    role: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    tableName: "roles"
});

module.exports = Role;

