'use strict';
module.exports = function(sequelize, DataTypes) {
  var Camera = sequelize.define('Camera', {
    field_id: DataTypes.INTEGER,
    folder_name: DataTypes.STRING,
    img_name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Camera;
};