var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('ticket',{
        supportticket:'real',
        itemname:'varchar(80)',
        serialnumber:'varchar(30)',
        invoicenumber:'varchar(30)',
        invoicedate:'varchar(10)',
        quantity:'real',
        rmadesc:'varchar(250)',
        status:'varchar(20)'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('ticket',callback);
};
