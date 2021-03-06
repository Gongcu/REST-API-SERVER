const Sequelize = require('sequelize');

module.exports = class User_favorite_club extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            itemOrder:{
                type:Sequelize.INTEGER,
                allowNull:false,
            }
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'User_favorite_club',
            tableName:'user_favorite_club',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.User_favorite_club.belongsTo(db.User,{foreignKey:'userId',targetKey:'id'});
        db.User_favorite_club.belongsTo(db.Club,{foreignKey:'clubId',targetKey:'id'});
    }
};