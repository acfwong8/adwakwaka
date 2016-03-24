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
var uploadTab = multer({ storage : storage}).single('tabPic');
var uploadHome = multer ({ storage : storage}).single('homePic');
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
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
    database:'siteinfo',
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
    });
});

var db = pgp(cn);

// var db = pgp('postgres://anguswong:yEwuKt61@localhost:3000/database/');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

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
// generator.on('token',function(token){
//     console.log('new token: ',token.user,token.accessToken);
// });
var rmaEmail = {};
// var smtpConfig = {
//     service: 'gmail',
//     auth: {
//         user:'acfwong10@gmail.com',
//         password:'shithole'
//     }
// }

var smtpConfig = 'smtps://'+rmaEmail.email+':'+rmaEmail.password+'@smtp.gmail.com'
var transporter = nodemailer.createTransport(smtpConfig);

var auth = {};
var timestamps = [{user:'',permissions:''}];
var current = currentAuth();
function currentAuth(){
    var currentAuth = {};
    return {
        setCurrentAuth: function(authn){
            currentAuth = authn;
            return currentAuth;
        },
        getCurrentAuth: function(){
            return currentAuth;
        }
    }
}
app.use(function(req,res,next){
    var cookie = req.cookies;
    console.log('loggin user');
    var user = cookie.user;
    console.log(user);
    if(user && user.user !== ''){
        db.one("SELECT username, permissions from login where lastlogin = ${stamp}",user)
            .then(function(response){
                console.log(response);
                var client = {
                    user: response.username,
                    permissions: response.permissions
                };
                current.setCurrentAuth(client);
                console.log(current.getCurrentAuth());
                next();
            })
            .catch(function(err){
                res.clearCookie('user');
                res.redirect('/');
                console.log('failed fetching login from db: '+err);
            });
    } else {
        next();
    }
});
passport.use(new localStrategy(
    function(username,password,done){
        var credentials = {};
        credentials.user = username;
        credentials.pass = password;

        db.one('SELECT * from login where username = ${user}',credentials)
            .then(function(response){
                var User = response;
                console.log(User);
                if (User){
                    success(User);
                }

                function success(user){
                    console.log(1);
                    if (!user){
                        console.log(2);
                        return done (null,false,{message: 'wrong user'});
                    }
                    if (user.password !== password){;
                        console.log(3)
                        return done(null,false,{message: 'wrong password'});
                    }
                    for(var i = 0; i < timestamps.length; i++){
                        console.log(4);
                        // if(timestamps[i].user = user.username && timestamps[i].sessionStart){
                        //     console.log(5);
                        //     return done(null,false,{message: 'User already logged on'})
                        // }
                    }
                    // auth.usernumb = timestamps.length + 1;
                    auth.user = username;
                    auth.permissions = user.permissions;
                    auth.sessionStart = Date.now();
                    timestamps.push(auth);
                    current.setCurrentAuth(auth);
                    console.log(current.getCurrentAuth());
                    // console.log(timestamps);
                    // console.log(auth)
                    return done(null,user)

                }
                
            })
            .catch(function(err){
                console.log('login fetch failed' + err);
            });
    }));
passport.serializeUser(function(user,done){
    console.log('serial');
    return done(null, user);
});
passport.deserializeUser(function(id,done){
    console.log('des');
    return done(err,user);
});
app.get('/verify',function(req,res,next){
    res.render('pleaselogin',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.use('/:var(new*|user/modify*|user/entries*|user/homepage*|user/remove*)',function(req,res,next){
    var cookies = req.cookies;
    console.log('new');
    console.log(cookies.user);
    if(cookies.user){
        if(cookies.user.permissions == 'superuser' || cookies.user.permissions == 'support'){
            next();
        } else {
            res.redirect('/verify');
        }
    } else {
        res.redirect('/verify');
    }
});

app.get('/', function(req,res,next){
    var name = 'Mantronic';
    console.log("first");
    console.log(current.getCurrentAuth());
    res.render('index',{companyname: name, username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
    console.log("then");
    console.log(current.getCurrentAuth());
});
app.get('/homepagereel',function(req,res,next){
    db.many("SELECT * from imagefrontpage")
        .then(function(response){
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            console.log('failed fetching homepage picture reel: '+err);
        });
});
app.get('/homepagearrivals',function(req,res,next){
    db.many("SELECT * from arrivals")
        .then(function(response){
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            console.log('failed fetching new arrivals: '+err);
        });
});
app.get('/homepageclearance',function(req,res,next){
    db.many("SELECT * from clearance")
        .then(function(response){
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            console.log('failed fetching new clearance: '+err);
        });
});
app.get('/closeconnection',function(req,res,next){
    current.setCurrentAuth(timestamps[0]);
    res.send('closed');
});

app.get('/getcategories',function(req,res,next){
    var categories = {};
    db.query('SELECT * from categoriesmain where catname is not null')
        .then(function(response){
            categories.children = response;
            db.query('SELECT * from parentcat')
                .then(function(resp){
                    categories.parents = resp;
                    res.send(categories);
                })
                .catch(function(error){
                    console.log('error in parentcat: '+error);
                });
        })
        .catch(function(err){
            console.log('error in main cat: '+err);
        });
    console.log(current.getCurrentAuth());
});


app.get('/login', function(req,res,next){
    console.log(timestamps);
    res.clearCookie('user');
    res.render('login');
});
app.post('/logon', passport.authenticate('local', {
    successRedirect:'/setuser',
    failureRedirect:'/loginfail'
}));
app.get('/setuser',function(req,res,next){
    var cookie = req.cookies;
    var user = current.getCurrentAuth();
    var stamp = Date.now();
    user.stamp = stamp;
    db.none('UPDATE login SET lastlogin = ${stamp} where username = ${user}',user)
        .then(function(){
            res.cookie('user',user);
            res.redirect('/');
            current.setCurrentAuth(timestamps[0]);
            console.log('logged user');
        })
        .catch(function(err){
            console.log('error logging: '+ err);
        });
})
app.get('/loginfail',function(rex,res,next){
    // console.log(timestamps);
    // console.log(auth);
    res.end('failed to login');
})
// app.post('/logon', function(req,res,next){
    
// });

app.get('/logout',function(req,res){
    req.logout();
    res.clearCookie('user');
    var currentId = current.getCurrentAuth();
    // for(var i = 0; i < timestamps.length; i++){
    //     console.log(timestamps[i]);
    //     console.log(currentId);
    //     if(timestamps[i].user == currentId.user && timestamps[i].sessionStart == currentId.sessionStart){
    //         console.log("splice "+timestamps[i]);
    //         timestamps.splice(i,1);
    //         current.setCurrentAuth(timestamps[0]);
    //     } else {
    //         console.log("notsplicing")
    //     }
    //     current.setCurrentAuth(timestamps[0]);
    // }
    current.setCurrentAuth(timestamps[0]);
    res.redirect('/')
});
app.get('/new',function(req,res,next){
    res.render('new',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
});

// user panel

app.get('/user',function(req,res,next){
    res.render('userpanel', {username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart})
    current.setCurrentAuth(timestamps[0]);
});

app.get('/user/view',function(req,res,next){
    res.render('rmaview', {username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart})
    current.setCurrentAuth(timestamps[0]);
})

// category creation

app.get('/new/category',function(req,res,next){
    res.render('newCat', {username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
});

app.post('/new/category/success',function(req,res,next){
    console.log('body: '+JSON.stringify(req.body));
    var catData = (req.body);
    console.log(catData);
    if(catData.catParent == ""){
        catData.depth = 0;
        db.none("INSERT into parentcat(catname,catdesc,hasparent,depth,children) values(${catName},${catDesc},${catParent},${depth},'')",catData)
            .then(function(){
                console.log('logged '+ catData);
                res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
            })
            .catch(function(err){
                console.log('error loggin parentcat '+ err);
            });
    } else if (catData.catParent !== "" && catData.catChildren == "yes"){
        console.log('logging empty parent, has children')
        db.query('SELECT * from parentcat where catname = ${catParent}',catData)
            .then(function(response){
                var data = response[0];
                console.log(data);
                console.log(data.children + 'this is the child');
                if(data.children == "" || data.children == null){
                    catData.newChildren = catData.catName + ";";
                    console.log(catData.newChildren);
                } else {
                    catData.newChildren = data.children + catData.catName + ";";
                }
                // console.log(catData.newChildren);
                catData.depth = data.depth + 1;
                db.none('UPDATE parentcat SET children = ${newChildren} where catname = ${catParent}',catData)
                    .then(function(){
                        console.log('updated parent')
                        db.none("INSERT into parentcat(catname,catdesc,hasparent,depth,children) values(${catName},${catDesc},${catParent},${depth},'')",catData)
                            .then(function(){
                                console.log('logged '+ catData);
                                res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
                            })
                            .catch(function(err){
                                console.log('error logging parentcat '+ err);
                            });                
                    })
                    .catch(function(err){
                        console.log('failed updating children: '+err);
                    });
            })
            .catch(function(err){
                console.log('failed fetching children from parent: '+ err);
            });
    } else if(catData.catParent !== "" && catData.catChildren == "no"){
        db.query('SELECT children from parentcat where catname = ${catParent}',catData)
            .then(function(response){
                var data = response[0];
                catData.depth = data.depth + 1;
                db.query('SELECT catnumb from categoriesmain where catnumb = (select max(catnumb) from categoriesmain)')
                    .then(function(res){
                        console.log(res[0].catnumb);
                        catData.catNumb = res[0].catnumb + 1;
                        if(data.children == "" || data.children == null){
                            catData.newChildren = catData.catName + catData.catNumb + ";";
                            // console.log(catData.newChildren);
                        } else {
                            catData.newChildren = data.children + catData.catName + catData.catNumb+ ";";
                        }
                        db.none('UPDATE parentcat SET children = ${newChildren} where catname = ${catParent}',catData)
                            .then(function(){
                                catData.nameNumb = catData.catName + catData.catNumb;
                                db.none('INSERT into categoriesmain("catname","catdesc","catnumb","subcat","namenumb") values(${catName},${catDesc},${catNumb},${catParent},${nameNumb})', catData)
                                    .then(function(){
                                        console.log('logged '+catData);
                                        res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
                                    })
                                    .catch(function(error){
                                        console.log('logging failed:'+error);
                                    });
                            })
                            .catch(function(err){
                                console.log(err);
                            });
                    })
                    .catch(function(err){
                        console.log('failed updating children: '+err);
                    });
            })
            .catch(function(err){
                console.log('failed fetching children from parent: '+ err);
            });
        res.send(req.body);
    }
});

// item creation

app.get('/new/item',function(req,res,next){
    var newItemNumb = 0;
    db.query('SELECT itemnumb from products where itemnumb = (select max(itemnumb) from products)')
        .then(function(response){
            newItemNumb = response[0].itemnumb+1;
            console.log(response);
            res.render('newItem',{ itemnumb: newItemNumb, username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
            current.setCurrentAuth(timestamps[0]);
        })
        .catch(function(err){
            console.log('help' + err);
        });
});
app.post('/new/item/success', function(req,res,next){
    // console.log('body: '+JSON.stringify(req.body));
    var itemData = req.body;
    itemData.picture = 'none';
    console.log(itemData);
    db.none('INSERT into products("itemname","itemid","itemdesc","itemdesclong","itemcat","itemcatnumb","itemnumb","itempicture1","price") values(${itemName},${itemId},${itemDesc},${itemDescLong},${itemCatName},${itemCatNumb},${itemNumb},${picture},${itemPrice})',itemData)
        .then(function(){
            console.log('logged ');
            console.log(itemData);
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
        res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    });
})

app.post('/new/picupload/picname',function(req,res,next){
    console.log(req.body);
    var itemData = {itemNumb: req.body.itemNumb};
    console.log(itemData);
    var filename = 'itemPic-';
    z = Date.now();
    console.log(z);
    db.one('SELECT itempicture1 from products where itemnumb = ${itemNumb}', itemData)
        .then(function(res){
            var picList = res.itempicture1;
            if(picList === 'none'){
                itemData.newPicList = filename + z;
            } else {
                // itemData.newPicList = picList + ';' + filename + z;
                itemData.newPicList = filename + z;
            }
            db.none('UPDATE products SET itempicture1 = ${newPicList} where itemnumb = ${itemNumb}', itemData)
                .then(function(){
                    console.log('uploading');
                    res.send('uploading');
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

// user creation

app.get('/new/user',function(req,res,next){
    res.render('newUser',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart})
});

app.post('/new/user/success',function(req,res,next){
    var newUser = req.body;
    console.log(newUser);
    if(newUser.password === newUser.confirm){
        db.none('INSERT into login("username","password","permissions") values(${username},${password},${type})',newUser)
            .then(function(){
                res.render('logged',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart})
            })
            .catch(function(err){
                console.log("error logging user: "+err);
            });
    }
    current.setCurrentAuth(timestamps[0]);
});

// modify categories

app.get('/user/modify',function(req,res,next){
    res.render('modify',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
})

app.get('/user/modify/category',function(req,res,next){
    res.render('modCat',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
        current.setCurrentAuth(timestamps[0]);
});

app.post('/user/modify/category/success',function(req,res,next){
    var changes = req.body;
    console.log('log');
    console.log(changes);
    changes.oldName = changes.oldCat.name;
    changes.oldNumb = changes.oldCat.numb;
    if(changes.oldCat.numb == 0){
        db.one('SELECT * from parentcat where catname = ${oldName}',changes)
            .then(function(response){
                console.log(response);
                changes.oldParent = response.hasparent;
                changes.children = response.children;
                changes.depth = response.depth;
                if(changes.depth > 0){
                    console.log(1);
                    db.one('SELECT * from parentcat where catname = ${oldParent}',changes)
                        .then(function(resp){
                            var children = resp.children.split(";");
                            for(var i = 0; i < children.length; i++){
                                if(children[i] == changes.oldName){
                                    children.splice(i,1);
                                    i--;
                                }
                            }
                            changes.oldParentChildren = children.join(";");
                            db.none('UPDATE parentcat SET children = ${oldParentChildren} where catname = ${oldParent}',changes)
                                .then(function(){
                                    db.one('SELECT * from parentcat where catname = ${catParent}',changes)
                                        .then(function(respo){
                                            console.log("newparent");
                                            console.log(respo);
                                            changes.depth = respo.depth + 1;
                                            if(respo.children == null || respo.children == ""){
                                                changes.newParentChildren = changes.catName + ";";
                                            } else {
                                                changes.newParentChildren = respo.children + changes.catName + ";";
                                            }
                                            console.log(changes);
                                            db.none('UPDATE parentcat SET children = ${newParentChildren} where catname = ${catParent}',changes)
                                                .then(function(){
                                                    db.none('DELETE from parentcat where catname = ${oldName}',changes)
                                                        .then(function(){
                                                            db.none('INSERT into parentcat("catname","catdesc","hasparent","children","depth") values(${catName},${catDesc},${catParent},${children},${depth})',changes)
                                                                .then(function(){
                                                                    var childArray = changes.children.split(";")
                                                                    for(var j = 0; j < childArray.length; j++){
                                                                        if(childArray[j] !== ""){
                                                                            changes.updateParent = childArray[j];
                                                                            console.log(changes);
                                                                            db.none('UPDATE categoriesmain SET subcat = ${catName} where subcat = ${oldName}',changes)
                                                                                .then(function(){
                                                                                    console.log("catmain");
                                                                                })
                                                                                .catch(function(errore){
                                                                                    console.log("failed updating children catmain: "+errore);
                                                                                });
                                                                            db.none('UPDATE parentcat SET hasparent = ${catName} where hasparent = ${oldName}',changes)
                                                                            .then(function(){
                                                                                console.log("parentcat");
                                                                            })
                                                                            .catch(function(errore){
                                                                                console.log("failed updating children parentcat: "+errore);
                                                                            });
                                                                        }
                                                                    }
                                                                })
                                                                .catch(function(erro){
                                                                    console.log("failed deleting: "+erro);
                                                                });
                                                        })
                                                        .catch(function(er){
                                                            console.log("updating fail old parent: "+ er) ;
                                                        });
                                                })
                                                .catch(function(e){
                                                    console.log("error with inserting new: "+ e) 
                                                });
                                            
                                        })
                                        .catch(function(iss){
                                            console.log("cannot update new parent: "+iss);
                                        });
                                })
                                .catch(function(issue){
                                    console.log("cannot query new parent: "+issue);
                                });
                            
                        })
                        .catch(function(error){
                            console.log("not getting depth from new parent: "+error);
                        });
                } else {
                    db.none('DELETE from parentcat where catname = ${oldName}',changes)
                        .then(function(){
                            db.none('INSERT into parentcat("catname","catdesc","hasparent","children","depth") values(${catName},${catDesc},${catParent},${children},${depth})',changes)
                                .then(function(){
                                    var childArray = changes.children.split(";")
                                    for(var j = 0; j < childArray.length; j++){
                                        if(childArray[j] !== ""){
                                            changes.updateParent = childArray[j];
                                            console.log(changes);
                                            db.none('UPDATE categoriesmain SET subcat = ${catName} where subcat = ${oldName}',changes)
                                                .then(function(){
                                                    console.log("catmain");
                                                })
                                                .catch(function(errore){
                                                    console.log("failed updating children catmain: "+errore);
                                                });
                                            db.none('UPDATE parentcat SET hasparent = ${catName} where hasparent = ${oldName}',changes)
                                                .then(function(){
                                                    console.log("parentcat");
                                                })
                                                .catch(function(errore){
                                                    console.log("failed updating children parentcat: "+errore);
                                                });
                                        }
                                    }
                                })
                                .catch(function(erro){
                                    console.log("failed deleting: "+erro);
                                });
                        })
                        .catch(function(er){
                            console.log("updating fail old parent: "+ er) ;
                        });
                }
            })
            .catch(function(err){
                console.log('parentcat does not exist: '+err);
            });
    } else {
        db.one('SELECT * from categoriesmain where catnumb = ${oldNumb}',changes)
            .then(function(response){
                console.log(response);
                changes.oldParent = response.subcat;
                db.one('SELECT * from parentcat where catname = ${oldParent}',changes)
                    .then(function(resp){
                        var children = resp.children.split(";");
                        for(var i = 0; i < children.length; i++){
                            console.log(children);
                            if(children[i] == changes.oldName+changes.oldNumb){
                                children.splice(i,1);
                                i--;
                            }
                        }
                        changes.oldParentChildren = children.join(";");
                        console.log(changes.oldParentChildren);
                        db.none('UPDATE parentcat SET children = ${oldParentChildren} where catname = ${oldParent}',changes)
                            .then(function(){
                                db.one('SELECT * from parentcat where catname = ${catParent}',changes)
                                    .then(function(respo){
                                        console.log("newparent");
                                        console.log(respo);
                                        changes.depth = respo.depth + 1;
                                        if(respo.children == null || respo.children == ""){
                                            changes.newParentChildren = changes.catName + changes.oldNumb + ";";
                                        } else {
                                            changes.newParentChildren = respo.children + changes.catName + changes.oldNumb + ";";
                                        }
                                        console.log(changes);
                                        db.none('UPDATE parentcat SET children = ${newParentChildren} where catname = ${catParent}',changes)
                                            .then(function(){
                                                console.log('parent set')
                                                db.none('DELETE from categoriesmain where catname = ${oldName}',changes)
                                                    .then(function(){
                                                        changes.nameNumb = changes.catname + changes.oldNumb;
                                                        db.none('INSERT into categoriesmain("catname","catdesc","subcat","catnumb","namenumb") values(${catName},${catDesc},${catParent},${oldNumb},${nameNumb})',changes)
                                                            .then(function(){
                                                            })
                                                            .catch(function(erro){
                                                                console.log("failed deleting: "+erro);
                                                            });
                                                    })
                                                    .catch(function(er){
                                                        console.log("updating fail old parent: "+ er) ;
                                                    });
                                            })
                                            .catch(function(e){
                                                console.log("error with inserting new: "+ e) 
                                            });
                                        
                                    })
                                    .catch(function(iss){
                                        console.log("cannot update new parent: "+iss);
                                    });
                            })
                            .catch(function(issue){
                                console.log("cannot query new parent: "+issue);
                            });
                    })
                    .catch(function(error){
                        console.log("not getting depth from new parent: "+error);
                    });
            })
            .catch(function(err){
                console.log('parentcat does not exist: '+err);
            });
    }
    res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
});

//remove things

app.get('/user/remove',function(req,res,next){
    res.render('remove',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});

app.get('/user/remove/user',function(req,res,next){
    res.render('removeUser',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.get('/user/remove/user/getusers',function(req,res,next){
    var cookie = res.cookie;
    db.many("SELECT * from login where permissions != 'superuser'")
        .then(function(resp){
            console.log(resp);
            res.send(resp);
        })
        .catch(function(err){
            console.log('failed fetching users: '+err);
        });
});
app.post('/user/remove/user/removeuser',function(req,res,next){
    var user = req.body;
    console.log(user);
    db.none("DELETE from login where username = ${name}",user)
        .then(function(){
            res.send('deleted!');
        })
        .catch(function(err){
            console.log('failed deleting the user: '+err);
        });
});

app.get('/user/remove/item',function(req,res,next){
    var cookie = req.cookies
    console.log('get cookie');
    console.log(cookie);
    res.render('removeItem',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.post('/user/remove/item/success',function(req,res,next){
    var item = req.body;
    console.log(item);
    db.none("DELETE from products where itemnumb = ${id}",item)
        .then(function(){
            db.none("DELETE from clearance where itemnumb = ${id}",item)
                .then(function(){
                })
                .catch(function(err){
                    console.log('failed deleting item from clearance: '+err);
                });
            db.none("DELETE from arrivals where itemnumb = ${id}",item)
                .then(function(){
                })
                .catch(function(err){
                    console.log('failed deleting item from arrivals: '+err);
                });
            res.send('deleted item with id from products: '+ item.id);
        })
        .catch(function(err){
            console.log('failed deleting item from products: '+err);
        });

});

app.get('/user/remove/category',function(req,res,next){
    res.render('removeCat',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.post('/user/remove/category/success',function(req,res,next){
    var catDelete = req.body;
    console.log("catDelete");
    console.log(catDelete);
    if(catDelete.PorC == 'child'){
        var cat = JSON.parse(catDelete.catName);
        db.one("SELECT * from categoriesmain where catnumb = ${numb}",cat)
            .then(function(response){
                cat.parent = response.subcat;
                cat.namenumb = response.namenumb;
                db.many("SELECT * from parentcat where catname = ${parent}",cat)
                    .then(function(resp){
                        for(var i = 0; i < resp.length; i++){
                            cat.children = resp[i].children;
                            var children = resp[i].children.split(';');
                            var index = children.indexOf(cat.namenumb);
                            db.none("DELETE from categoriesmain where namenumb = ${namenumb}",cat)
                                .then(function(){
                                    if(index == 0 && children.length <= 2){
                                        db.none("UPDATE parentcat set children = '' where children = ${children}",cat)
                                            .then(function(){
                                                res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
                                            })
                                            .catch(function(er){
                                                console.log("failed updating old children on parent: "+er);
                                            });
                                    } else if(index >= 0){
                                        console.log(children);
                                        children.splice(index,1);
                                        console.log(children);
                                        cat.newChildren = children.join(';');
                                        console.log(cat.newChildren);
                                        db.none("UPDATE parentcat set children = ${newChildren} where children = ${children}",cat)
                                            .then(function(){
                                                res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
                                            })
                                            .catch(function(er){
                                                console.log("failed updating old children on parent: "+er);
                                            });
                                    }
                                })
                                .catch(function(error){
                                    console.log("failed deleting from categoriesmain: "+error);
                                });
                        }
                    })
                    .catch(function(erro){
                        console.log('failed fetching parent of cat to update: '+erro);
                    });
            })
            .catch(function(err){
                console.log("failed fetching child cat to delete: "+err);
            });
    } else if (catDelete.PorC == 'parent'){
        var cat = catDelete;
        cat.name = catDelete.catName;
        db.many("SELECT * from parentcat where catname = ${name}",cat)
            .then(function(response){
                cat.parent = response[0].hasparent;
                cat.depth = response[0].depth;
                console.log(cat);
                if(cat.parent !== '' && cat.parent !== null){
                    db.many("SELECT * from parentcat where catname = ${parent}",cat)
                        .then(function(resp){
                            for(var i = 0; i < resp.length; i++){
                                cat.children = resp[i].children;
                                var children = resp[i].children.split(';');
                                var index = children.indexOf(cat.name);
                                console.log(index);
                                db.none("DELETE from parentcat where catname = ${name} and children is null or children = ''",cat)
                                    .then(function(){
                                        if(index == 0 && children.length <= 2){
                                            db.none("UPDATE parentcat set children = '' where children = ${children}",cat)
                                                .then(function(){
                                                    res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
                                                })
                                                .catch(function(er){
                                                    console.log("failed updating old children on parent: "+er);
                                                });
                                        } else if(index >= 0){
                                            console.log(children);
                                            children.splice(index,1);
                                            console.log(children);
                                            cat.newChildren = children.join(';');
                                            console.log(cat.newChildren);
                                            db.none("UPDATE parentcat set children = ${newChildren} where children = ${children}",cat)
                                                .then(function(){
                                                    res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
                                                })
                                                .catch(function(er){
                                                    console.log("failed updating old children on parent: "+er);
                                                });
                                        }
                                    })
                                    .catch(function(erro){
                                        console.log("failed deleting from parentcat: "+ erro);
                                    });
                            }
                        })
                        .catch(function(error){
                            console.log("failed retrieving parent for deleting parent: "+error);
                        });
                } else {
                    db.none("DELETE from parentcat where catname = ${name} and depth = ${depth}",cat)
                        .then(function(){
                            
                        })
                        .catch(function(error){
                            console.log("Failed deleting depth 0 cat: "+error);
                        });
                }
            })
            .catch(function(err){
                console.log("failed selecting parentcat for deleting: "+ err);
            });             
    }
});

// modifying item

app.get('/user/modify/item',function(req,res,next){
    res.render('modItem',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
})

app.get('/itemlist',function(req,res,next){
    db.many('SELECT * from products')
        .then(function(response){
            res.send(response);
        })
        .catch(function(err){
            console.log('error fetching products: '+err);
        });
});

app.post('/user/modify/item/success',function(req,res,next){
    var newItem = req.body;
    newItem.oldCatNumb = newItem.oldParent.numb;
    newItem.oldCatName = newItem.oldParent.name;
    newItem.newCatNumb = newItem.newParent.numb;
    newItem.newCatName = newItem.newParent.name;
    console.log(newItem);
    db.one('SELECT * from products where itemnumb = ${itemNumb}',newItem)
        .then(function(response){
            newItem.itemPic = response.itempicture1;
            db.none('DELETE from products where itemnumb = ${itemNumb}',newItem)
                .then(function(){
                    db.none('INSERT into products("itemname","itemid","itemdesc","itemcat","itempicture1","itemnumb","itemcatnumb","price","itemdesclong") values(${itemName},${itemId},${itemDesc},${newCatName},${itemPic},${itemNumb},${newCatNumb},${newPrice},${newLongDesc})',newItem)
                        .then(function(){
                            console.log('logged');
                            console.log(newItem);
                        })
                        .catch(function(erro){
                            console.log('failed inserting: '+erro);
                        });
                })
                .catch(function(error){
                    console.log('failed deleting old item: '+error);
                });
        })
        .catch(function(err){
            console.log('failed selecting categoriesmain: '+err);
        });
    res.send('don');
})

// edit main tabs
app.get('/user/entries',function(req,res,next){
    res.render('tabItems',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});

app.get('/user/entries/ourbusiness',function(req,res,next){
    res.render('ourBusiness',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});    
});
app.post('/user/entries/settext',function(req,res,next){
    var text = req.body;
    console.log(text);
    db.one('SELECT tabpicture from tabs where tabname = ${tab}',text)
        .then(function(resp){
            text.picture = resp.tabpicture;
            db.none('DELETE from tabs where tabname = ${tab}',text)
                .then(function(respond){
                    db.none('INSERT into tabs("tabname","tabtext","tabpicture") values(${tab},${text},${picture})',text)
                        .then(function(response){
                            console.log('inserting business tab text');
                        })
                        .catch(function(err){
                            console.log('failed setting tabs for text: '+err);
                        });
                })
                .catch(function(error){
                    console.log('failed deleting old entry: '+error);
                });
        })
        .catch(function(erro){
            console.log('failed getting tabpicture: '+err);
        });
});
app.post('/user/entries/tabpicname',function(req,res,next){
    var tab = req.body;
    console.log(tab);
    var filename = 'tabPic-';
    z = Date.now();
    db.one('SELECT tabpicture from tabs where tabname = ${tab}',tab)
        .then(function(response){
            console.log(response);
            var picList = response.tabpicture;
            if(picList === null){
                tab.newPicList = filename + z;
            } else {
                tab.newPicList = picList + ';' + filename + z;
                // tab.newPicList = filename + z;
            }
            db.none('UPDATE tabs SET tabpicture = ${newPicList} where tabname = ${tab}',tab)
                .then(function(){
                    console.log('uploading');
                    res.send('uploading');
                })
                .catch(function(erro){
                    console.log('error updating piclist: '+ erro);
                });
        })
        .catch(function(err){
            console.log('failed getting tabs: '+err);
        });
});
app.post('/user/entries/tabpicupload/',function(req,res,next){
    uploadTab(req,res,function(err){
        if(err){
            return res.end("Error uploading tab picture: "+ err);
        }
        res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    })
});

app.get('/user/entries/contact',function(req,res,next){
    db.query('SELECT * from googleapi')
        .then(function(resp){
            var key = resp[0].apikey;
            res.render('contact',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart, apikey: key});
        })
        .catch(function(err){
            console.log('failed getting google api: '+err);
        });
});
app.get('/getcontacts',function(req,res,next){
    db.many("SELECT * from contact where type = 'rep'")
        .then(function(resp){
            res.send(resp);
        })
        .catch(function(err){
            console.log('failed fetching contact details: '+err);
        });
});
app.post('/updatecontacts',function(req,res,next){
    var contact = req.body;
    console.log(contact);
    db.none("DELETE from contact where contactno = ${number}",contact)
        .then(function(){
            db.none("INSERT into contact(contact,number,email,contactno,type) values(${name},${phone},${email},${number},'rep')",contact)
                .then(function(){
                    
                })
                .catch(function(err){
                    console.log('failed updating contact info: '+err);
                });
        })
        .catch(function(err){
            console.log('failed deleting old contact: '+err);
        });
});
app.post('/newcontact',function(req,res,next){
    var contact = req.body;
    db.one('SELECT contactno from contact where contactno = (select max(contactno) from contact)')
        .then(function(response){
            console.log(response);
            contact.number = response.contactno + 1;
            console.log(contact);
            db.none("INSERT into contact(contact,number,email,contactno,type) values(${name},${phone},${email},${number},'rep')",contact)
                .then(function(response){
                    res.end();
                })
                .catch(function(err){
                    console.log('failed inserting new contact: '+err);
                });
        })
        .catch(function(err){
            console.log('failed fetching max contac number: '+err);
        });
});
app.post('/setaddress',function(req,res,next){
    var location = req.body;
    console.log(location);
    db.none("DELETE from contact where type = ${type}",location)
        .then(function(){
            db.none('INSERT into contact(type,address,lat,lng,address2) values(${type},${address},${lat},${lng},${fullAddress})',location)
                .then(function(){
                    res.end();
                })
                .catch(function(err){
                    console.log('failed writing in new address'+ err);
                });
        })
        .catch(function(err){
            console.log('failed deleting old address');
        });
});
app.get('/getaddress',function(req,res,next){
    db.many("SELECT * from contact where type = 'place'")
        .then(function(resp){
            res.send(resp[0]);
        })
        .catch(function(err){
            console.log('failed fetching address details: '+err);
        });
});
app.get('/user/entries/rmasupport',function(req,res,next){
    res.render('rmaSupport',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.get('/user/entries/footer',function(req,res,next){
    res.render('footerEdit',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});

// tab pages
app.get('/getbusiness',function(req,res,next){
    db.many("SELECT * from tabs where tabname = 'business' and tabtext is not null")
        .then(function(response){
            console.log('getting business text');
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            console.log("failed fetching business tab: "+err);
        });
});
app.get('/business',function(req,res,next){
    res.render('business',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.get('/getrma',function(req,res,next){
    db.many("SELECT * from tabs where tabname = 'rma' and tabtext is not null")
        .then(function(response){
            console.log('getting rma text');
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            console.log("failed fetching rma tab: "+err);
        });
});
app.get('/getfooter',function(req,res,next){
    db.many("select * from tabs where tabname = 'footer' and tabtext is not null")
        .then(function(response){
            res.send(response);
        })
        .catch(function(err){
            console.log('failed fetching footer: '+ err);
        });
});
app.get('/contact',function(req,res,next){
    db.query('SELECT * from googleapi')
        .then(function(resp){
            var key = resp[0].apikey
            res.render('tabcontact',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart, apikey: key});
        })
        .catch(function(err){
            console.log('failed fetching google api: '+err);
        });
});

//homepage edit
app.get('/user/homepage',function(req,res,next){
    res.render('homepageEdit',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.get('/user/homepage/picturereel',function(req,res,next){
    res.render('pictureHomepage',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.post('/user/homepage/setpic',function(req,res,next){
    var homePicData = req.body
    console.log(req.body);
    db.none('INSERT into imagefrontpage(imagename,imagecaption,imagedesc) values(${name},${caption},${desc})',homePicData)
        .then(function(){
            res.send('uploading');
        })
        .catch(function(err){
            console.log('Error inserting image details: '+err);
        });
});
app.get('/user/homepage/getpictures',function(req,res,next){
    db.many('SELECT * from imagefrontpage')
        .then(function(response){
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            console.log('failed fetching homepage pictures: '+err);
        });
});
app.post('/user/homepage/deletepicture',function(req,res,next){
    var pic = req.body;
    console.log(pic);
    db.none("DELETE from imagefrontpage * where imagename = ${name}",pic)
        .then(function(){
            
        })
        .catch(function(err){
            console.log("failed deleting image: "+err);
        });
});
app.post('/user/homepage/homepicname',function(req,res,next){
    var homePicData = req.body;
    console.log(homePicData);
    var filename = 'homePic-';
    z = Date.now();
    db.one('SELECT imagename from imagefrontpage where imagename = ${name}',homePicData)
        .then(function(response){
            console.log(response);
            var picList = response.imagefile;
            if(picList === null){
                homePicData.newPicList = filename + z;
            } else {
                // homePicData.newPicList = picList + ';' + filename + z;
                homePicData.newPicList = filename + z;
            }
            db.none('UPDATE imagefrontpage SET imagefile = ${newPicList} where imagename = ${name}',homePicData)
                .then(function(){
                    console.log('uploading');
                    res.send('uploading');
                })
                .catch(function(erro){
                    console.log('error updating piclist: '+ erro);
                });
        })
        .catch(function(err){
            console.log('failed getting tabs: '+err);
        });
});
app.post('/user/homepage/homepicupload',function(req,res,next){
    uploadHome(req,res,function(err){
        if(err){
            return res.end("Error uploading" + err);
        }
        res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    });
})

app.get('/user/homepage/newarrivals',function(req,res,next){
    res.render('arrivalsHomepage',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.post('/user/homepage/setarrivals',function(req,res,next){
    var arrivalItem = req.body;
    console.log('setarrivals');
    console.log(arrivalItem);
    db.none("INSERT into arrivals(itemname, itemid, itempic, itemnumb, itemcatnumb, price, currency) values(${itemname}, ${itemid}, ${itempicture1}, ${itemnumb}, ${itemcatnumb}, ${price},${currency})",arrivalItem)
        .then(function(){
            console.log('loggin');
            res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
        })
        .catch(function(err){
            console.log('failed logging new arrivals: '+err);
        });
});
app.get('/user/homepage/retrievearrivals',function(req,res,next){
    db.many("SELECT * from arrivals")
        .then(function(response){
            res.send(response);
        })
        .catch(function(err){
            console.log('failed retreiving arrivals: '+err);
        });
});
app.post('/user/homepage/removearrivals',function(req,res,next){
    var item = req.body;
    console.log(item);
    db.none("DELETE from arrivals where itemnumb = ${numb}",item)
        .then(function(){
            res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
        })
        .catch(function(err){
            console.log("failed deleting entry: "+err);
        });
});

app.get('/user/homepage/clearance',function(req,res,next){
    res.render('clearanceHomepage',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});
app.post('/user/homepage/setclearance',function(req,res,next){
    var clearanceItem = req.body;
    console.log('setarrivals');
    console.log(clearanceItem);
    db.none("INSERT into clearance(itemname, itemid, itempic, itemnumb, itemcatnumb, price, newprice, currency) values(${itemname}, ${itemid}, ${itempicture1}, ${itemnumb}, ${itemcatnumb}, ${price}, ${newPrice}, ${currency})",clearanceItem)
        .then(function(){
            console.log('loggin');
            res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
        })
        .catch(function(err){
            console.log('failed logging new arrivals: '+err);
        });
});
app.get('/user/homepage/retrieveclearance',function(req,res,next){
    db.many("SELECT * from clearance")
        .then(function(response){
            res.send(response);
        })
        .catch(function(err){
            console.log('failed retreiving clearance: '+err);
        });
});
app.post('/user/homepage/removeclearance',function(req,res,next){
    var item = req.body;
    console.log(item);
    db.none("DELETE from clearance where itemnumb = ${numb}",item)
        .then(function(){
            res.render("logged",{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
        })
        .catch(function(err){
            console.log("failed deleting entry: "+err);
        });
});

// categories and items listing

app.get('/category', function(req,res,next){
    var catName = 'laptop';
    res.render('categories',{category: catName});
});

app.get('/category/:id/products',function(req,res,next){
    var id = req.params.id;
    var dbParam = {};
    dbParam.id = id;
    console.log(current.getCurrentAuth());
    db.one('SELECT * from categoriesmain where catnumb = ${id}',dbParam)
        .then(function(response){
            res.render('listItem',{catname: response.catname, catnumb: response.catnumb, username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
            logging.pop();
            current.setCurrentAuth(timestamps[0]);
            next();
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
    var dbParam = {};
    dbParam.itemId = itemId;
    db.one('SELECT * from products where itemnumb = ${itemId}',dbParam)
        .then(function(response){
            console.log(current.getCurrentAuth());
            res.render('theItem',{itemname: response.itemname, itemnumb: response.itemnumb, username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
            current.setCurrentAuth(timestamps[0]);
            next();
        })
        .catch(function(err){
            res.end('failed loading: '+ err);
        });
});

app.get('/getitem/:itemid',function(req,res,next){
    var itemId = req.params.itemid;
    var dbParam = {};
    dbParam.itemId = itemId;
    db.one('SELECT * from products where itemnumb = ${itemId}',dbParam)
        .then(function(response){
            console.log(response);
            res.send(response);
        })
        .catch(function(err){
            res.end('item query failed: ' + err);
        });
});

// RMA Support

app.use('/support',function(req,res,next){
    console.log(1);
    db.many("SELECT * from emails where name = 'angus'")
        .then(function(response){
            rmaEmail.email = response[0].email.replace('@','%40');
            rmaEmail.password = response[0].mailpass;
            console.log(rmaEmail);
            smtpConfig = 'smtps://'+rmaEmail.email+':'+rmaEmail.password+'@smtp.gmail.com'
            transporter = nodemailer.createTransport(smtpConfig);
            // smtpConfig = 'smtps://acfwong10%40gmail.com:shithole@smtp.gmail.com'
            next();
        })
        .catch(function(err){
            console.log("failed retrieving rma email info: "+err);
            res.redirect('/');
        });
});

app.get('/support',function(req,res,next){
    res.render('rmapage',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
});

app.post('/support/submit',function(req,res,next){
    console.log(req.body);
    var rmaForm = req.body;
    var rmaVar = rmaForm.rma[0];
    var persVar = rmaForm.personal;
    var currentTicket = 0;
    var newTicket = 0;
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDay();
    var hour = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    var dash = "-";
    var col = ":";
    var theDate = year + dash + month + dash + day + " " + hour + col + minutes + col + seconds;
    persVar.date = theDate;
    var invDate = rmaVar.invYear + dash + rmaVar.invMonth + dash + rmaVar.invDay;
    rmaVar.invDate = invDate;
    rmaVar.defaultstatus = "pending";
    console.log(rmaVar);
    console.log(persVar);
    var mailtext = {}
    mailtext.rma = rmaVar;
    mailtext.pers = persVar;
    db.one('SELECT max(supportticket) from ticket')
        .then(function(response){
            currentTicket = Math.max(100,response.max);
            newTicket = currentTicket+1;
            rmaVar.newTicket = newTicket;
            persVar.newTicket = newTicket;
            db.none('INSERT INTO ticket("supportticket","itemname","itemcode","serialnumber","invoicenumber","invoicedate","quantity","rmadesc","status") values(${newTicket},${item},${code},${number},${invoice},${invDate},${quantity},${description},${defaultstatus})',rmaVar)
                .then(function(){
                    console.log('logged');
                    console.log(rmaVar);
                    db.none('INSERT INTO support("username","name","company","date","email","addressstreet","addresscity","addressprovince","supportticket","postal","number") values(${user},${name},${company},${date},${email},${street},${city},${prov},${newTicket},${postal},${phone})',persVar)
                        .then(function(){
                            console.log('logged');
                            var mail = {
                                from:persVar.email,
                                to:'rma@mantronic.com',
                                subject:'rma test',
                                html:'<p>RMA request sent from: '+persVar.name+' ('+persVar.email+') of '+persVar.company+'</p><p>Contact Number: '+persVar.phone+'</p><p>Address: '+persVar.street+', '+persVar.city+', '+persVar.prov+', '+persVar.postal+'</p><p>Sent at: '+persVar.date+'</p><p>Item Name: '+rmaVar.item+'</p><p>Item Code: '+rmaVar.code+'</p><p>Serial Number: '+rmaVar.number+'</p><p>Quantity: '+rmaVar.quantity+'</p><p>Invoice Number: '+rmaVar.invoice+'</p><p>Invoice Date: '+invDate+'</p><p>Reason for RMA: '+rmaVar.description+'</p><p>Ticket Number: '+rmaVar.newTicket+'</p>'
                            }
                            transporter.sendMail(mail,function(error,info){
                                if(error){
                                    return console.log(error);
                                }
                                console.log('email sent: '+info.response);
                            });
                            res.end();
                            console.log(persVar);
                        })
                        .catch(function(err){
                            console.log('personal err ' + err)
                        });
                })
                .catch(function(err){
                    console.log('rma err ' + err);
                });

        })
        .catch(function(err){
            console.log("fetch failed "+err);
        });
});

app.post('/support/updatestatus',function(req,res,next){
    var newStatus = req.body;
    db.none("UPDATE ticket set status = ${status} where supportticket = ${ticket}",newStatus)
        .then(function(){
            console.log('status changed'+newStatus.ticket+" "+newStatus.status);
        })
        .catch(function(err){
            console.log('failed updating status of rma: '+err);
        });
});

app.get('/support/gettickets', function(req,res,next){
    var data = {};
    db.many('SELECT * from ticket')
        .then(function(response){
            data.ticket = response;
            db.many('SELECT * from support')
                .then(function(resp){
                    data.personal = resp;
                    console.log(data);
                    res.send(data);
                })
                .catch(function(err){
                    console.log('err with support: '+ err);
                });
        })
        .catch(function(err){
            console.log('failed '+ err);
        });
    
})

app.listen(3000);
