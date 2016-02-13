var parentCat = [];
$.ajax({
    type:'GET',
    url:'http://'+serverIP+'/getcategories',
    dataType:'JSON',
    success: function(res){
        console.log(res);
        var maxDepth = 0;
        for(var i = 0; i < res.parents.length; i++){
            var parent = {};
            parent.name = res.parents[i].catname;
            parent.depth = res.parents[i].depth;
            parent.parent = res.parents[i].hasParent;
            parentCat.push(parent);
            if(parent.depth == 0){
                appendmain(parent.name);
            } else {
                appendsub(parent.name);
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
    var $button = $("<button>").text(name);
    var $p = $("<p>").append($button);
    $(".sidebar").append($p);
}

function appendsub(name){
    var $button = $("<button>").text(name).attr("class","subcat");
    var $p = $("<p>").append($button).attr("class","subcatp").addClass("hidden");
    $(".sidebar").append($p);    
}
