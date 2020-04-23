let AWS = require('aws-sdk');
AWS.config.update({
    region: "ap-northeast-1"
});
let docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName:"RankData"
};
var is_err = false;
docClient.scan(params, function(err, data){
    if(err) console.log(err);
    else{
        data.Items.forEach(function(val){
            var params = {
                TableName : "RankData",
                Key : {
                    title : val.title,
                    difficulty : val.difficulty
                }
            }
            docClient.delete(params, function(err){
                if(err) {
                    console.log(err);
                    is_err = true;
                }
            })
        })
        if(is_err) console.log("Some error occured.");
        else console.log("All data were deleted successfully!");
        
    }
})