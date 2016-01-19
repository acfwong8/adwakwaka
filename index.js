var z = 0;

var express = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'./uploads');
    },
    filename: function(req,file,callback){
        var filename = file.fieldname + '-' + z + '.jpg';
        callback(null,filename);
    }
});
var upload = multer({ storage : storage}).single('itemPic');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var pplocal = require('passport-local');
var session = require('express-session');
var logger = require('morgan');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var pg = require('pg');
var pgp = require('pg-promise')(/*options*/);

var app = express();
// var config = require('./config.js');
// var funct = require('./functions.js');
app.use(cookieParser());
app.use(logger('combined'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static('uploads'));

var cn = {
    host:'localhost',
    port:'5432',
    database:'info',
    user:'anguswong',
    password:'yEwuKt61'
};

var cns = 'postgres://'+cn.user+':'+cn.password+'@'+cn.host+':'+cn.port+'/'+cn.database;
console.log(cns);

var userdata = [];
pg.connect(cns,function(err,client,done){
    if(err){
        return console.error('error fetching',err);
    }
    client.query('SELECT * from login',function(err,result){
        done();
        if(err){
            return console.error('error runnin query',err);
        }
        console.log(result.rows[0].username);
        userdata.push(result.rows[1].username);
    });
});

var db = pgp(cn);

// var db = pgp('postgres://anguswong:yEwuKt61@localhost:3000/database/');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

db.query("SELECT * from login")
    .then(function(data){
        console.log("Data:",data);
        return(data);
    })
    .catch(function(error){
        console.log("ERROR:",error);
    });

var saveCategory = function(){
    var categories = [];
    return {
        save: function(entry){
            categories.push(entry);
        }
        
    }
}

app.set('index',path.join(__dirname,'views'));
app.set('view engine','jade');

app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(req,res,next){
    var name = userdata;
    console.log(name);
    res.render('index',{companyname: name});

});



app.get('/getcategories',function(req,res,next){
    var categories = {};
    pg.connect(cns,function(err,client,done){
        if(err){
            return console.error('error fetching',err);
        }
        client.query('SELECT * from categoriesmain where catname is not null',function(err,result){
            done();
            if(err){
                return console.error('error runnin query',err);
            }
            console.log(result.rows);
            categories = result.rows;
            res.send(categories);
        });
    });
    // res.send(categories);
});

app.get('/login', function(req,res,next){
    res.render('login');
});
app.post('/logon', passport.authenticate('signIn', {
    successRedirect:'/',
    failureRedirect:'/login'
})
        );

app.get('/new',function(req,res,next){
    res.render('new');
});

// category creation

app.get('/new/category',function(req,res,next){
    res.render('newCat');
});

app.post('/new/category/success',function(req,res,next){
    console.log('body: '+JSON.stringify(req.body));
    var catData = (req.body);
    console.log(catData);
    db.query('SELECT catnumb from categoriesmain where catnumb = (select max(catnumb) from categoriesmain)')
        .then(function(res){
            console.log(res[0].catnumb);
            catData.catNumb = res[0].catnumb + 1;
            db.none('INSERT into categoriesmain("catname","catdesc","catnumb") values(${catName},${catDesc},${catNumb})', catData)
                .then(function(){
                    console.log('logged '+catData);
                })
                .catch(function(error){
                    console.log('logging failed:'+error);
                });
        })
        .catch(function(err){
            console.log(err);
        });

    res.send(req.body);
    // res.end('Category created');
});

// item creation

app.get('/new/item',function(req,res,next){
    var newItemNumb = 0;
    db.query('SELECT itemnumb from products where itemnumb = (select max(itemnumb) from products)')
        .then(function(response){
            newItemNumb = response[0].itemnumb+1;
            console.log(response);
            res.render('newItem',{ itemnumb: newItemNumb});
        })
        .catch(function(err){
            console.log('help' + err);
        })

});
app.post('/new/item/success', function(req,res,next){
    // console.log('body: '+JSON.stringify(req.body));
    var itemData = req.body;
    console.log(itemData);
    console.log(3);
    itemData.picture = 'none';
    db.none('INSERT into products("itemname","itemdesc","itemcat","itemcatnumb","itemnumb","itempicture1") values(${itemName},${itemDesc},${itemCatName},${itemCatNumb},${itemNumb},${picture})',itemData)
        .then(function(){
            console.log('logged '+itemData);

            // res.send('uploaded');
        })
        .catch(function(error){
            console.log('logging failed:'+error);
        });
});

app.post('/new/picupload',function(req,res,next){
    upload(req,res,function(err){
        if(err){
            return res.end("Error uploading");
        }
    });
    res.send('<FORM><INPUT Type="button" VALUE="Back" onClick="history.go(-1);return true;"></FORM>')
    // res.send("File is uploaded");
})

app.post('/new/picupload/picname',function(req,res,next){
    console.log(req.body);
    var itemData = {itemNumb: req.body.itemNumb};
    console.log(itemData);
    var filename = 'itemPic-'
    // var date = new Date();
    // console.log(z);
    z = Date.now();
    console.log(z);
    db.one('SELECT itempicture1 from products where itemnumb = ${itemNumb}', itemData)
        .then(function(res){
            var picList = res.itempicture1;
            if(picList === 'none'){
                itemData.newPicList = filename + z;
            } else {
                itemData.newPicList = picList + '-' + filename + z;
            }
            db.none('UPDATE products SET itempicture1 = ${newPicList} where itemnumb = ${itemNumb}', itemData)
                .then(function(){
                    console.log('uploading');
                })
                .catch(function(err){
                    res.end('Upload failed column: ' + err);
                });              
        })
        .catch(function(err){
            console.log('query failed: '+ err);
            res.end('Upload failed: ' + err);
        });
});


// app.post('/success',function(req,res,next){
//     upload(req,res,function(err){
//         if(err){
//             return res.end("Error uploading");
//         }
//         res.end("File is uploaded");
//     });
//     // console.log(req.files);
// });

// categories and items listing

app.get('/category', function(req,res,next){
    var catName = 'laptop';
    res.render('categories',{category: catName});
});

app.get('/category/:id/products',function(req,res,next){
    var id = req.params.id;
    var dbParam = {};
    dbParam.id = id;
    db.one('SELECT * from categoriesmain where catnumb = ${id}',dbParam)
        .then(function(response){
            console.log(response);
            res.render('listItem',{catname: response.catname, catnumb: response.catnumb});
        })
        .catch(function(err){
            res.end('failed loading: '+err);
        });
})

app.get('/getitems/:id',function(req,res,next){
    var id = req.params.id;
    var dbParam = {};
    dbParam.id = id;
    db.many('select * from products where itemcatnumb = ${id}',dbParam)
        .then(function(response){
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            console.log("item query failed: "+err);
            res.end("item query failed:" + err);
        });
})

// item display

app.get('/category/:catid/products/:itemid',function(req,res,next){
    var itemId = req.params.itemid;
})

app.listen(3000);
