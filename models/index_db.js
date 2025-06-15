const db = require("../utils/db.js");
const Role = require('./role_db.js');
const Permission = require('./permission_db.js');
const RolePermissionMapping = require('./rpmapping_db.js');
const User = require('./user_db.js');
const Task = require('./task_db.js');

Role.belongsToMany(Permission, {
    through: RolePermissionMapping,
    foreignKey: 'RoleId',
    otherKey: 'PermissionId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Permission.belongsToMany(Role, {
    through: RolePermissionMapping,
    foreignKey: 'PermissionId',
    otherKey: 'RoleId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE' 
});

Role.hasMany(User, {
    foreignKey: 'roleId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
User.belongsTo(Role, {
    foreignKey: 'roleId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

User.hasMany(Task, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Task.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = {
    Role,
    Permission,
    User,
    Task,
    RolePermissionMapping
};
