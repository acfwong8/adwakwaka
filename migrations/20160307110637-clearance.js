var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('clearance',{
        itemname: 'varchar(80)',
        itemid: 'varchar(80)',
        itempic: 'varchar(80)',
        itemnumb: 'real',
        itemcatnumb: 'real',
        price: 'real',
        newprice: 'real',
        currency: 'varchar(10)'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('clearance',callback);
};
