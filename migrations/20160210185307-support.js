var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('support',{
        username:'varchar(80)',
        name:'varchar(80)',
        company:'varchar(80)',
        date:'varchar(80)',
        email:'varchar(80)',
        number:'text',
        postal:'text',
        salesrep:'varchar(80)',
        addressstreet:'varchar(120)',
        addresscity:'varchar(40)',
        addressprovince:'varchar(20)',
        supportticket:'real'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('support',callback);
};
