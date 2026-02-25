const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Input = sequelize.define('Input', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'un',
  },
  stock_quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Input;
