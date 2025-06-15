const Sequelize = require('sequelize');
const db = require('../utils/db.js');
const Role = require('./role_db.js');
const Permission = require('./permission_db.js');

const RolePermissionMapping = db.define('RolePermissionMapping', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        allowNull: false,
        primaryKey: true
    }
}, {
    tableName: 'RolePermissionMapping',
    timestamps: true,
});

module.exports = RolePermissionMapping;