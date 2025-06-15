const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db"); // Your Sequelize instance

const Task = sequelize.define("Task", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users", 
            key: "id"
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
   },
    location: {
        type: DataTypes.STRING, 
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE, 
        allowNull: true
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'tasks'
});

module.exports = Task;
