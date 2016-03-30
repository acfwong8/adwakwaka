var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('login',{
        username:'varchar(20)',
        password:'varchar(20)',
        permissions:'varchar(80)',
        lastlogin:'real',
        failedlogin:'real',
        lastfailed:'text',
        status:'text',
        meshy:'text'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('login',callback);
};
