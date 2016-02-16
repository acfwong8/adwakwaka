if(creds.getPermissions() !== 'superuser' || creds.getPermissions() !== 'support' || creds.getPermissions() !== 'client'){
    $(".main").empty();
    var $a = $("<a>").attr("href","/login").text("Unauthorized access. Contact admin to access.")
    $(".main").append($a);
}
