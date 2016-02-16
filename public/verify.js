if(creds.getPermissions() !== 'superuser'){
    $(".main").empty();
    var $a = $("<a>").attr("href","/login").text("Unauthorized access. Contact admin to access.")
    $(".main").append($a);
}
