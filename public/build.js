if(creds.getPermissions() == '' || creds.getPermissions() == undefined){
    var $a = $("<a>").attr("href","/login").text("Login as user");
    $(".login").append($a);
    
} else if(creds.getPermissions() == 'superuser') {
    var $span = $("<span>").text("Welcome, " + creds.getUser()+" | ");
    var $a = $("<a>").attr("href","/logout").attr("class","logout").text("Log out");
    $(".login").append($span, $a);
    var $toola = $("<a>").attr("href","/user").text("User Panel");
    var $li = $("<li>").append($toola);
    $(".toolbar ul").append($li)
    
} else if(creds.getPermissions() == 'support'){
    var $span = $("<span>").text("Welcome, " + creds.getUser()+" | ");
    var $a = $("<a>").attr("href","/logout").attr("class","logout").text("Log out");
    $(".login").append($span, $a);
    var $toola = $("<a>").attr("href","/user").text("User Panel");
    var $li = $("<li>").append($toola);
    $(".toolbar ul").append($li)
    
} else if(creds.getPermissions() == 'client'){
    var $span = $("<span>").text("Welcome, " + creds.getUser()+" | ");
    var $a = $("<a>").attr("href","/logout").attr("class","logout").text("Log out");
    $(".login").append($span, $a);
    var $toola = $("<a>").attr("href","/user").text("User Panel");
    var $li = $("<li>").append($toola);
    $(".toolbar ul").append($li)
}

$(window).bind("beforeunload",function(){
    var currentAuth = {};
    currentAuth.user = creds.getUser();
    currentAuth.permissions = creds.getPermissions();
    currentAuth.sessionStart = creds.getTimestamp();
    $.ajax({
        type:'POST',
        url:"http://"+serverIP+"/userstat/",
        data:JSON.stringify(currentAuth),
        contentType:"application/json",
        success: function(res){
        },
        fail: function(fail){
            console.log(fail);
        }
    });
});
