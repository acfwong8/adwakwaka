var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('imagefrontpage',{
        imagename:'varchar(80)',
        imagefile:'varchar(80)',
        imagecaption:'text',
        imagedesc:'text'
    },callback)
};

exports.down = function(db, callback) {
    db.dropTable('imagefrontpage',callback);
};
