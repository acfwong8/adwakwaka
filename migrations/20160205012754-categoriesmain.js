var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('categoriesmain',{
        catname:'varchar(80)',
        catdesc:'varchar(140)',
        subcat:'varchar(80)',
        catnumb:'real'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('categoriesmain',callback);
};
