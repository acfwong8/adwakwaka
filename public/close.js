$.ajax({
    type:'GET',
    url:'http://'+ serverIP + '/closeconnection',
    success: function(res){
        console.log(res);
    }
});
