var parentCat = [];
var childrenCat = [];
var oldCat = {};
var newCat = {};
$.ajax({
    type:'GET',
    url:'http://'+serverIP+'/getcategories',
    dataType:'JSON',
    success: function(res){
        res.parents.sort(function(a,b){
            if(a.depth > b.depth){
                return 1;
            }
            if(a.depth < b.depth){
                return -1;
            }
            var textA = a.catname.toUpperCase();
            var textB = b.catname.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        res.children.sort(function(a,b){
            if(a.namenumb.toUpperCase() > b.namenumb.toUpperCase()){
                return 1;
            }
            if(a.namenumb.toUpperCase() < b.namenumb.toUpperCase()){
                return -1;
            }
            return 0;
        })
        // console.log(res);
        var maxDepth = 0;
        var appendCat = res.parents;
        for(var i = 0; i < res.children.length; i++){
            var child = {};
            child.name = res.children[i].catname;
            child.numb = res.children[i].catnumb;
            child.desc = res.children[i].catdesc;
            if(res.children[i].subcat){
                child.parent = res.children[i].subcat;
            }
            // console.log(child);
            childrenCat.push(child);
        }
        for(var i = 0; i < res.parents.length; i++){
            var parent = {};
            parent.name = res.parents[i].catname;
            parent.depth = res.parents[i].depth;
            parent.parent = res.parents[i].hasparent;
            parent.desc = res.parents[i].catdesc;
            if(res.parents[i].children){
                var childArray = res.parents[i].children
                parent.sortChildren = childArray.split(";");
                parent.sortChildren.sort(function(a,b){
                    var textA = a.toUpperCase();
                    var textB = b.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                var joined = parent.sortChildren.join(';').replace(/\s/g,'');
                console.log(joined);
                parent.children = joined.split(';');
                console.log(parent.children);
                // var children = [];
                // for(var j = 0; j < parent.children.length; j++){
                //     var child = parent.children[j];
                //     for(var k = 0; k < childrenCat.length; k++){
                //         if(childrenCat[k].name + childrenCat[k].numb == child){
                //             children.push(child);
                //             parent.children.splice(j,1);
                //         }
                //     }
                // }
                // for(var j = 0; j < children.length; j++) {
                //     parent.children.push(children[j]);
                // }
            }
            parentCat.push(parent);
            if(parent.depth == 0){
                appendmain(parent.name);
            } else {
                appendsub(parent.name,parent.parent,parent.depth);
            }
            if (i == res.parents.length - 1){
                // catClick(parentCat);
            }
        }
        for(var i = 0; i < res.children.length; i++){
            var child = {};
            child.name = res.children[i].catname.replace(/\s/g,'');
            child.nameSpaces = res.children[i].catname
            child.catname = res.children[i].catname
            child.numb = res.children[i].catnumb;
            child.desc = res.children[i].catdesc;
            if(res.children[i].subcat){
                child.parent = res.children[i].subcat.replace(/\s/g,'');
                for(var j = 0; j < parentCat.length; j++){
                    if(res.children[i].subcat == parentCat[j].name){
                        child.depth = parentCat[j].depth + 1;
                    }
                }
                appendchild(child.name,child.nameSpaces,child.parent,child.numb,child.desc,child.depth);
            }
        }
        if($(".parent")){
            for(var i = 0; i < parentCat.length; i++){
                var $option = $("<option>").val(parentCat[i].name).text(parentCat[i].name);
                $(".parent").append($option);
            }
        }
        if($(".newItemCat").length > 0){
            console.log(1);
            for(var i = 0; i < childrenCat.length; i++){
                var $option = $("<option>").val(JSON.stringify({numb: childrenCat[i].numb,name: childrenCat[i].name})).text(childrenCat[i].name);
                $(".newItemCat").append($option);
            }
            $(".changeCat").removeClass("newItemCat");
        }
        if($(".modClass").length > 0){
            for(var i = 0; i < parentCat.length; i++){
                var $option = $("<option>").val(parentCat[i].name).text(parentCat[i].name);
                $(".modClass").append($option)
            }
            $(".PorC").on("change",function(){
                if($(".PorC").val() == 'child'){
                    $(".modClass").empty();
                    for(var j = 0; j < childrenCat.length; j++){
                        var $option = $("<option>").val(JSON.stringify({numb: childrenCat[j].numb,name: childrenCat[j].name})).text(childrenCat[j].name);
                        $(".modClass").append($option);
                    }
                }
                if($(".PorC").val() == 'parent'){
                    $(".modClass").empty();
                    for(var j = 0; j < parentCat.length; j++){
                        var $option = $("<option>").val(parentCat[j].name).text(parentCat[j].name);
                        $(".modClass").append($option);
                    }
                }
                if($(".PorC").val() == 'child'){
                    $(".newCatName").val(JSON.parse($(".modClass").val()).name);
                    oldCat.name = JSON.parse($(".modClass").val()).name;
                    oldCat.numb = JSON.parse($(".modClass").val()).numb;
                    for(var j = 0; j < childrenCat.length; j++){
                        if(childrenCat[j].numb == JSON.parse($(".modClass").val()).numb){
                            $(".newCatDesc").val(childrenCat[j].desc);
                            var element = document.getElementById("whichParent");
                            element.value = childrenCat[j].parent;
                        }
                    }
                }
                if($(".PorC").val() == 'parent'){
                    $(".newCatName").val($(".modClass").val());
                    oldCat.name = $(".modClass").val();
                    for(var j = 0; j < parentCat.length; j++){
                        if(parentCat[j].name == $(".modClass").val()){
                            $(".newCatDesc").val(parentCat[j].desc);
                            var element = document.getElementById("whichParent");
                            element.value = parentCat[j].parent;
                        }
                    }
                }
                
            });
            $(".modClass").on("change",function(){
                if($(".PorC").val() == 'child'){
                    $(".newCatName").val(JSON.parse($(".modClass").val()).name);
                    oldCat.name = JSON.parse($(".modClass").val()).name;
                    oldCat.numb = JSON.parse($(".modClass").val()).numb;
                    for(var j = 0; j < childrenCat.length; j++){
                        if(childrenCat[j].numb == JSON.parse($(".modClass").val()).numb){
                            $(".newCatDesc").val(childrenCat[j].desc);
                            var element = document.getElementById("whichParent");
                            element.value = childrenCat[j].parent;
                        }
                    }
                }
                if($(".PorC").val() == 'parent'){
                    $(".newCatName").val($(".modClass").val());
                    oldCat.name = $(".modClass").val();
                    oldCat.numb = 0;
                    for(var j = 0; j < parentCat.length; j++){
                        if(parentCat[j].name == $(".modClass").val()){
                            $(".newCatDesc").val(parentCat[j].desc);
                            var element = document.getElementById("whichParent");
                            element.value = parentCat[j].parent;
                        }
                    }
                }
            });
        }
        
        if($(".deleteClass").length > 0){
            for(var i = 0; i < parentCat.length; i++){
                var $option = $("<option>").val(parentCat[i].name).text(parentCat[i].name);
                if(parentCat[i].children || parentCat[i].children == ''){
                    
                }else{
                    $(".deleteClass").append($option)
                }
            }
            $(".PorC").on("change",function(){
                if($(".PorC").val() == 'child'){
                    $(".deleteClass").empty();
                    for(var j = 0; j < childrenCat.length; j++){
                        var $option = $("<option>").val(JSON.stringify({numb: childrenCat[j].numb,name: childrenCat[j].name})).text(childrenCat[j].name);
                        $(".deleteClass").append($option);
                    }
                }
                if($(".PorC").val() == 'parent'){
                    $(".deleteClass").empty();
                    for(var j = 0; j < parentCat.length; j++){
                        var $option = $("<option>").val(parentCat[j].name).text(parentCat[j].name);
                        if(parentCat[j].children || parentCat[j].children == ''){
                            
                        }else{
                            $(".deleteClass").append($option);
                        }
                    }
                }
                if($(".PorC").val() == 'child'){
                    $(".newCatName").val(JSON.parse($(".deleteClass").val()).name);
                    oldCat.name = JSON.parse($(".deleteClass").val()).name;
                    oldCat.numb = JSON.parse($(".deleteClass").val()).numb;
                    for(var j = 0; j < childrenCat.length; j++){
                        if(childrenCat[j].numb == JSON.parse($(".deleteClass").val()).numb){
                            $(".newCatDesc").val(childrenCat[j].desc);
                            var element = document.getElementById("whichParent");
                            element.value = childrenCat[j].parent;
                        }
                    }
                }
                if($(".PorC").val() == 'parent'){
                    $(".newCatName").val($(".deleteClass").val());
                    oldCat.name = $(".deleteClass").val();
                    for(var j = 0; j < parentCat.length; j++){
                        if(parentCat[j].name == $(".deleteClass").val()){
                            $(".newCatDesc").val(parentCat[j].desc);
                            var element = document.getElementById("whichParent");
                            element.value = parentCat[j].parent;
                        }
                    }
                }
                
            });
        }
        catClick(parentCat);
    }
})
function appendmain(name){
    var newName = name.replace(/\s/g,'').replace('(','%28').replace(')','%29');
    var $button = $("<button>").text(name).addClass("mainCat cat appear").attr("id","cat"+newName);
    var $p = $("<p>").append($button).addClass("catp");
    var $div = $("<div>").append($p).attr("id","div"+newName).addClass('catdiv');
    $(".sidebar").append($div);
}

function appendsub(name,parent,depth){
    var newName = name.replace(/\s/g,'').replace('(','%28').replace(')','%29');
    var newParent = parent.replace(/\s/g,'').replace('(','\\%28').replace(')','\\%29');
    var $button = $("<button>").text(name).attr("class","subCat"+ depth).addClass("subCat cat").attr("id","cat"+newName);
    var $p = $("<p>").append($button).attr("class","subCatp" + depth).addClass("hidden subCatp catp invisible").attr("id","catp"+newName);
    var $div = $("<div>").append($p).attr("id","div"+newName).addClass('catdiv');
    $("#div"+newParent).append($div);
    var nextDepth = depth + 1

}

function appendchild(name,nameSpaces,parent,numb,desc,depth){
    var $a = $("<a>").text(nameSpaces).attr("href","/category/"+numb+"/products");
    var $p = $("<p>").addClass("hidden invisible childp subCatp subCatp" + depth).attr("id","catp"+name+numb).append($a);
    var $div = $("<div>").append($p).attr("id","div"+name);
    var newParent = parent.replace('(','\\%28').replace(')','\\%29');
    var div = "#div"+newParent;
    $(div).append($div);
}

function appendCat(){
    var $2div = $("<div>").append($div)
    var $div = $("<div>").addClass("catExpand").append($2div);
    var $p = $("<button>").text("Product Catalogue").addClass("expand");
    $2div.append($p);
    $("body").append($div);
    $(".expand").css({'width': $(".catExpand").height(),
                      'height': $(".catExpand").width()
                      // 'left': $(".catExpand").position().left
                     });
}
appendCat();
$(".sidebar").on("mouseover",function(){
    $(".sidebar").css({'margin-left': 0});
    $(".catExpand").css({'margin-left': -45});
});
$(".sidebar").on("mouseout",function(){
    $(".sidebar").css({'margin-left': -210});
    $(".catExpand").css({'margin-left': 0});
});
$(".expand").on("click",function(){
    $(".sidebar").css({'margin-left': 0});
    $(".catExpand").css({'margin-left': -45});
});
$(".catExpand").on("mouseover",function(){
    $(".sidebar").css({'margin-left': 0});
    $(".catExpand").css({'margin-left': -45});
});
$(document).on("scroll",function(){
    // console.log(1);
    var top = $(window).scrollTop();
    var lock = 100;
    if (top <= lock){
        $(".catExpand").css({'top': 157})
        $("section.sidebar").css({'top': 157})
    } else {
        $(".catExpand").css({'top': top + 57});
        $("section.sidebar").css({'top': top + 57});
    }
});

function catClick(catArray){
    $(".cat").on("click",function(){
        var name = this.id;
        var maxDepth = catArray[catArray.length - 1].depth
        for(var i = 0; i < catArray.length; i++){
            var aName = "cat"+catArray[i].name.replace(/\s/g,'').replace('(','%28').replace(')','%29');
            if(name == aName){
                var child = catArray[i].children;
                console.log(child);
                // child.sort(function(a,b){
                //     var textA = a.toUpperCase();
                //     var textB = b.toUpperCase();
                //     return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                // });
                for(var j = 1; j < catArray[i].children.length; j++){
                    // console.log(child[j],j);
                    if($("#catp"+child[j]).hasClass("hidden")){
                        $("#catp"+child[j]).removeClass("hidden invisible").addClass('appear');
                        // console.log('unhide');
                    } else{
                        // $("#catp"+child[j]).addClass("hidden");
                        for(var k = maxDepth+1; k >= catArray[i].depth; k--){
                            // console.log($($(this).parent().parent())[0].children[j+1]);
                            var $parent = $($(this).parent().parent())[0].children[j];
                            // console.log( $($(this).parent().parent())[0].children)
                            if($parent){
                                var id = $parent.getAttribute('id');
                                if($("#"+id+" .subCatp"+k)){
                                    // console.log('hide');
                                    console.log(id,k);
                                    $("#"+id+" .subCatp"+k).addClass("invisible").removeClass('appear');
                                    // setTimeout(500,function(){
                                    $("#"+id+" .subCatp"+k).addClass("hidden");
                                    // });
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

