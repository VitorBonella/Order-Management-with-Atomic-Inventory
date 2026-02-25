const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ProductInput = sequelize.define('ProductInput', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity_used: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
  },
});

module.exports = ProductInput;
