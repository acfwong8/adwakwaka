var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('parentcat',{
        catname:'varchar(80)',
        catdesc:'varchar(80)',
        hasParent:'varchar(80)',
        children:'varchar(80)',
        depth:'real'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('parentcat',callback);
};
