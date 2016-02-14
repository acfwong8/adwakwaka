var parentCat = [];
$.ajax({
    type:'GET',
    url:'http://'+serverIP+'/getcategories',
    dataType:'JSON',
    success: function(res){
        console.log(res);
        res.parents.sort(function(a,b){
            if(a.depth > b.depth){
                return 1;
            }
            if(a.depth < b.depth){
                return -1;
            }
            return 0;
        });
        console.log(res);
        var maxDepth = 0;
        var appendCat = res.parents;
        for(var i = 0; i < res.parents.length; i++){
            var parent = {};
            parent.name = res.parents[i].catname;
            parent.depth = res.parents[i].depth;
            parent.parent = res.parents[i].hasparent;
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
            child.numb = res.children[i].catnumb
            if(res.children[i].subcat){
                child.parent = res.children[i].subcat.replace(/\s/g,'');
                appendchild(child.name,child.parent,child.numb);
            }
        }
        if($(".parent")){
            for(var i = 0; i < parentCat.length; i++){
                var $option = $("<option>").val(parentCat[i].name).text(parentCat[i].name);
                $(".parent").append($option);
            }
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
    console.log(newName);
    $(".sidebar").append($div);
}

function appendsub(name,parent,depth){
    var newName = name.replace(/\s/g,'');
    var newParent = parent.replace(/\s/g,'');
    var $button = $("<button>").text(name).attr("class","subCat"+ depth).addClass("subCat cat").attr("id","cat"+newName);
    var $p = $("<p>").append($button).attr("class","subCatp" + depth).addClass("hidden subCatp catp").attr("id","catp"+newName);
    var $div = $("<div>").append($p).attr("id","div"+newName);
    $("#div"+newParent).append($div);
    console.log(newName);
    var nextDepth = depth + 1

}

function appendchild(name,parent,numb){
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


