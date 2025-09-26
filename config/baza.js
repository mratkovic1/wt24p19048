// baza.js
const Sequelize = require("sequelize");

const sequelize = new Sequelize("wt24", "root", "password", {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Isključi SQL logove za čišći ispis
});

module.exports = sequelize;