//footer
function footerInsert(text){
    var $footer = $("<footer>");
    var $divFooter = $("<div>").addClass("footerdiv");
    var $pFooter = $("<p>").text(text).addClass("footertext");
    $divFooter.append($pFooter);
    $footer.append($divFooter);
    $("body").append($footer);
}

$.ajax({
    type:'GET',
    dataType:'json',
    url:'http://'+serverIP+'/getfooter',
    success: function(res){
        console.log(res[0].tabtext);
        footerInsert(res[0].tabtext);
    }
})

$.ajax({
    type:'GET',
    url:'http://'+ serverIP + '/closeconnection',
    success: function(res){
        console.log(res);
    }
});
