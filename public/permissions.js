function cred(){
    var auth = {};
    return {
        setCred: function(){
            auth.user = "#{username}";
            auth.permissions = "#{permissions}";
            return auth;
        },
        getUser: function(){
            return auth.user;
        },
        getPermissions: function(){
            return auth.permissions
        }
    }
}
var creds = cred();
creds.setCred();
