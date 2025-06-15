const { DataTypes } = require('sequelize');
const db = require('../utils/db.js');

const Permission = db.define('Permission', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        allowNull: false,
        primaryKey: true
    },
    permission: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'permissions',
    timestamps: true
});

module.exports = Permission;
