var parentCat = [];
var childrenCat = [];
var oldCat = {};
var newCat = {};
$.ajax({
    type:'GET',
    url:'http://'+serverIP+'/getcategories',
    dataType:'JSON',
    success: function(res){
        // res.parents.sort(function(a,b){
        //     var textA = a.catname.toUpperCase();
        //     var textB = b.catname.toUpperCase();
        //     return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        // });
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
        console.log(res);
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
            console.log(child);
            childrenCat.push(child);
        }
        for(var i = 0; i < res.parents.length; i++){
            var parent = {};
            parent.name = res.parents[i].catname;
            parent.depth = res.parents[i].depth;
            parent.parent = res.parents[i].hasparent;
            parent.desc = res.parents[i].catdesc;
            if(res.parents[i].children){
                var childArray = res.parents[i].children.replace(/\s/g,'');
                parent.children = childArray.split("-");
            }
            parentCat.push(parent);
            if(parent.depth == 0){
                appendmain(parent.name);
            } else {
                appendsub(parent.name,parent.parent,parent.depth);
            }
            if (i == res.parents.length - 1){
                catClick(parentCat);
            }
        }
        for(var i = 0; i < res.children.length; i++){
            var child = {};
            child.name = res.children[i].catname.replace(/\s/g,'');
            child.catname = res.children[i].catname
            child.numb = res.children[i].catnumb;
            child.desc = res.children[i].catdesc;
            if(res.children[i].subcat){
                child.parent = res.children[i].subcat.replace(/\s/g,'');
                appendchild(child.name,child.parent,child.numb,child.desc);
            }
        }
        if($(".parent")){
            for(var i = 0; i < parentCat.length; i++){
                var $option = $("<option>").val(parentCat[i].name).text(parentCat[i].name);
                $(".parent").append($option);
            }
        }
        if($(".newItemCat")){
            for(var i = 0; i < childrenCat.length; i++){
                var $option = $("<option>").val(JSON.stringify({numb: childrenCat[i].numb,name: childrenCat[i].name})).text(childrenCat[i].name);
                $(".newItemCat").append($option);
            }
        }
        if($(".modClass")){
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
        // for(var i = 0; i< res.length; i++){
        //     appendp(res[i].catname,res[i].catnumb);
        // }
        console.log(parentCat);
    }
})
function appendmain(name){
    var newName = name.replace(/\s/g,'');
    var $button = $("<button>").text(name).addClass("mainCat cat").attr("id","cat"+newName);
    var $p = $("<p>").append($button).addClass("catp");
    var $div = $("<div>").append($p).attr("id","div"+newName);
    $(".sidebar").append($div);
}

function appendsub(name,parent,depth){
    var newName = name.replace(/\s/g,'');
    var newParent = parent.replace(/\s/g,'');
    var $button = $("<button>").text(name).attr("class","subCat"+ depth).addClass("subCat cat").attr("id","cat"+newName);
    var $p = $("<p>").append($button).attr("class","subCatp" + depth).addClass("hidden subCatp catp").attr("id","catp"+newName);
    var $div = $("<div>").append($p).attr("id","div"+newName);
    $("#div"+newParent).append($div);
    var nextDepth = depth + 1

}

function appendchild(name,parent,numb,desc){
    var $a = $("<a>").text(name).attr("href","/category/"+numb+"/products");
    var $p = $("<p>").addClass("hidden").attr("id","catp"+name+numb).append($a);
    var $div = $("<div>").append($p);
    $("#div"+parent).append($div);
}

function catClick(catArray){
    $(".cat").on("click",function(){
        var name = this.id;
        for(var i = 0; i < catArray.length; i++){
            var aName = "cat"+catArray[i].name.replace(/\s/g,'');
            if(name == aName){
                var child = catArray[i].children;
                for(var j = 0; j < catArray[i].children.length; j++){
                    if($("#catp"+child[j]).hasClass("hidden")){
                        $("#catp"+child[j]).removeClass("hidden");
                    } else{
                        $("#catp"+child[j]).addClass("hidden");                        
                    }
                }
            }
        }
    });
}


