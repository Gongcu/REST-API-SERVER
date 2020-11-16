const Sequelize = require('sequelize');

module.exports = class Club extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            image:{
                type:Sequelize.STRING,
                allowNull:false,
                defaultValue:"",
            },
            backgroundImage:{
                type:Sequelize.STRING,
                allowNull:false,
                defaultValue:"",
            },
            poster:{
                type:Sequelize.STRING,
                allowNull:false,
                defaultValue:"",
            },
            campus:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            text:{
                type:Sequelize.STRING,
                allowNull:true,
                defaultValue:"",
            },
            nicknameRule:{
                type:Sequelize.STRING(30),
                allowNull:true,
            },
            certification:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            type:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            classification:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            membershipFee:{
                type:Sequelize.INTEGER,
                allowNull:true,
                defaultValue:0,
            },
            memberCount:{
                type:Sequelize.INTEGER,
                allowNull:true,
            },
            recruitment:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true,
            },
            feedExposure:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true,
            },
            noticeExposure:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true,
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Club',
            tableName:'clubs',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Club.hasMany(db.Club_user,{foreignKey:'clubId',sourceKey:'id'});
        db.Club.hasMany(db.ApplicationForm,{foreignKey:'clubId',sourceKey:'id'});
        db.Club.hasMany(db.User_favorite_club,{foreignKey:'clubId',sourceKey:'id'});
        db.Club.hasMany(db.Question,{foreignKey:'clubId',sourceKey:'id'});
        db.Club.hasMany(db.Post,{foreignKey:'clubId',sourceKey:'id'});
        db.Club.hasMany(db.Chatroom,{foreignKey:'clubId',sourceKey:'id'});
        db.Club.hasMany(db.Club_hashtag,{foreignKey:'clubId',sourceKey:'id'});
        db.Club.hasMany(db.Alarm,{foreignKey:'clubId',sourceKey:'id'});
    }
};