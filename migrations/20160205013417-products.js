var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('products',{
        itemname:'varchar(80)',
        itemid:'varchar(80)',
        itemdesc:'varchar(255)',
        itemcat:'varchar(80)',
        itempicture1:'varchar(80)',
        itemnumb:'real',
        itemcatnumb:'real',
        price:'real',
        itemdesclong:'varchar(400)',
        currency:'varchar(10)'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('products',callback);
};
