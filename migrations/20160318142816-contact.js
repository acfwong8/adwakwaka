var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('contact',{
        type:'text',
        address:'text',
        contact:'text',
        number:'text',
        email:'text',
        picture:'text',
        contactno:'real',
        details:'text',
        lat:'real',
        lng:'real',
        address2:'text'
    },callback);
};

exports.down = function(db, callback) {
    db.dropTable('contact',callback);
};
