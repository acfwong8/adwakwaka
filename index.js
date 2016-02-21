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


var auth = {};
var timestamps = [{user:'',permissions:'',sessionStart:''}];
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
                    return done(null,{username: user.username})

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

app.get('/', function(req,res,next){
    var name = userdata;
    // console.log('req.body');
    // console.log(req.body);
    // userstat(req.body);
    // if(req.body.user == ''){
    //     console.log(1);
    //     userstat(req.body);
    // } else {
    //     console.log(2);
    //     userstat(req.body);
    // }
    console.log("first");
    console.log(current.getCurrentAuth());
    res.render('index',{companyname: name, username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
    console.log("then");
    console.log(current.getCurrentAuth());
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
});


app.get('/login', function(req,res,next){
    console.log(timestamps);
    res.render('login');
});
app.post('/logon', passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/loginfail'
}));
app.get('/loginfail',function(rex,res,next){
    // console.log(timestamps);
    // console.log(auth);
    res.end('failed to login');
})
// app.post('/logon', function(req,res,next){
    
// });

app.get('/logout',function(req,res){
    req.logout();
    var currentId = current.getCurrentAuth();
    for(var i = 0; i < timestamps.length; i++){
        console.log(timestamps[i]);
        console.log(currentId);
        if(timestamps[i].user == currentId.user && timestamps[i].sessionStart == currentId.sessionStart){
            console.log("splice "+timestamps[i]);
            timestamps.splice(i,1);
            current.setCurrentAuth(timestamps[0]);
        } else {
            console.log("notsplicing")
        }
        current.setCurrentAuth(timestamps[0]);
    }
    res.redirect('/')
});
function userstat(object){
    current.setCurrentAuth(object);
}
app.post('/userstat',function(req,res,next){
    console.log('userstat');
    var id = req.body;
    console.log(id);
    current.setCurrentAuth(id);
    next();
})

app.get('/new',function(req,res,next){
    res.render('new',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});

// user panel

app.get('/user',function(req,res,next){
    res.render('userpanel', {username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart})
});

app.get('/user/view',function(req,res,next){
    res.render('rmaview', {username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart})
})

// category creation

app.get('/new/category',function(req,res,next){
    res.render('newCat', {username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
});

app.post('/new/category/success',function(req,res,next){
    console.log('body: '+JSON.stringify(req.body));
    var catData = (req.body);
    console.log(catData);
    if(catData.catParent == ""){
        catData.depth = 0;
        db.none('INSERT into parentcat("catname","catdesc","hasparent","depth") values(${catName},${catDesc},${catParent},${depth})',catData)
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
                        db.none('INSERT into parentcat("catname","catdesc","hasparent","depth") values(${catName},${catDesc},${catParent},${depth})',catData)
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
                                db.none('INSERT into categoriesmain("catname","catdesc","catnumb","subcat") values(${catName},${catDesc},${catNumb},${catParent})', catData)
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
        })
        .catch(function(err){
            console.log('help' + err);
        })

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

    // res.send("File is uploaded");
})

app.post('/new/picupload/picname',function(req,res,next){
    console.log(req.body);
    var itemData = {itemNumb: req.body.itemNumb};
    console.log(itemData);
    var filename = 'itemPic-'
    z = Date.now();
    console.log(z);
    db.one('SELECT itempicture1 from products where itemnumb = ${itemNumb}', itemData)
        .then(function(res){
            var picList = res.itempicture1;
            if(picList === 'none'){
                itemData.newPicList = filename + z;
            } else {
                itemData.newPicList = picList + ';' + filename + z;
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
});

// modify categories

app.get('/user/modify',function(req,res,next){
    res.render('modify',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
})

app.get('/user/modify/category',function(req,res,next){
    res.render('modCat',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
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
                                                                        db.none('UPDATE categoriesmain SET subcat = ${catName} where namenumb = ${updateParent}',changes)
                                                                            .then(function(){
                                                                                console.log("catmain");
                                                                            })
                                                                            .catch(function(errore){
                                                                                console.log("failed updating children catmain: "+errore);
                                                                            });
                                                                        db.none('UPDATE parentcat SET hasparent = ${catName} where catname = ${updateParent}',changes)
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
                                                        db.none('INSERT into categoriesmain("catname","catdesc","subcat","catnumb") values(${catName},${catDesc},${catParent},${oldNumb})',changes)
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
})

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
    var dbParam = {};
    dbParam.itemId = itemId;
    db.one('SELECT * from products where itemnumb = ${itemId}',dbParam)
        .then(function(response){
            res.render('theItem',{itemname: response.itemname, itemnumb: response.itemnumb, username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
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
            // response.newdesclong = response.itemdesclong.replace("\n","<br/>");
            console.log(response.itemdesclong);
            // console.log(response.newdesclong);
            res.send(response);
        })
        .catch(function(err){
            res.end('item query failed: ' + err);
        });
});

// RMA Support

app.get('/support',function(req,res,next){
    res.render('rmapage',{username: current.getCurrentAuth().user, permissions: current.getCurrentAuth().permissions, sessionStart: current.getCurrentAuth().sessionStart});
    current.setCurrentAuth(timestamps[0]);
})

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
    db.one('SELECT max(supportticket) from ticket')
        .then(function(response){
            currentTicket = Math.max(100,response.max);
            newTicket = currentTicket+1;
            rmaVar.newTicket = newTicket;
            persVar.newTicket = newTicket;
            db.none('INSERT INTO ticket("supportticket","itemname","serialnumber","invoicenumber","invoicedate","quantity","rmadesc","status") values(${newTicket},${item},${number},${invoice},${invDate},${quantity},${description},${defaultstatus})',rmaVar)
                .then(function(){
                    console.log('logged');
                    console.log(rmaVar);
                    db.none('INSERT INTO support("name","company","date","email","addressstreet","addresscity","addressprovince","supportticket") values(${name},${company},${date},${email},${street},${city},${prov},${newTicket})',persVar)
                        .then(function(){
                            console.log('logged');
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
