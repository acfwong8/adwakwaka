var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('testing',{
        id: 'real',
        name:'string'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('testing',callback);
};
