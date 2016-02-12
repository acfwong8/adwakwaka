var categories = [];
$.ajax({
    type:'GET',
    url:'http://'+serverIP+'/getcategories',
    dataType:'JSON',
    success: function(res){
        for(var i = 0; i< res.length; i++){
            appendp(res[i].catname,res[i].catnumb);
        }
    }
})
function appendp(name,numb){
    var $a = $("<a>").text(name).attr("href","/category/"+numb+"/products");
    var $p = $("<p>").append($a);
    $(".sidebar").append($p);
}
