$('.newCat').on('submit',function(){
    var catName = $('.newCatName').val();
    var catDesc = $('.newCatDesc').val();
    var catItem = {
        'catName': catName,
        'catDesc': catDesc
    };
    var test = {'hello':'hellothere'};
    $.ajax({
        type:'POST',
        data:JSON.stringify(catItem),
        contentType: 'application/json',
        url:'http://localhost:3000/new/category/success',
        success: function(res){
            console.log('success');
            console.log(JSON.stringify(res));
        }
    })
})
