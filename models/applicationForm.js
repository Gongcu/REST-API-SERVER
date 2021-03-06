const Sequelize = require('sequelize');
const formatDateTime = require('../etc/formatDateTime.js');

module.exports = class ApplicationForm extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            nickname:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            gender:{
                type:Sequelize.STRING(2),
                allowNull:false,
            },
            birth:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            campus:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            college:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            department:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            studentNumber:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            phone:{
                type:Sequelize.STRING(20),
                allowNull:true,
            },
            residence:{
                type:Sequelize.STRING(30),
                allowNull:false,
                defaultValue:"",
            },
            experience:{
                type:Sequelize.TEXT,
                allowNull:false,
                defaultValue:"",
            },
            isApproved:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            createdAt:{
                type:Sequelize.STRING(20),
                allowNull:false,
                defaultValue:formatDateTime(Date()),
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'ApplicationForm',
            tableName:'applicationforms',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.ApplicationForm.belongsTo(db.User,{foreignKey:'userId',targetKey:'id'});
        db.ApplicationForm.belongsTo(db.Club,{foreignKey:'clubId',targetKey:'id'});
        db.ApplicationForm.hasMany(db.Alarm,{foreignKey:'applicationFormId',sourceKey:'id',onDelete: 'CASCADE'});
    }
};
