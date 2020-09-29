let AWS = require("aws-sdk");

function LoadData(){
    let AWS = require("aws-sdk");
    let fs = require('fs');

    AWS.config.update({
        region: "ap-northeast-1"
    });

    let docClient = new AWS.DynamoDB.DocumentClient();

    var rankdata = JSON.parse(fs.readFileSync('gitadora_rankdata.json', 'utf8'));
    rankdata.forEach(function(element) {
        var title = element.title;
        var difficulty = element.difficulty;
        var params = {
            TableName : "DiffData",
            Key : {
                title : title,
                difficulty : difficulty
            }
        };
        var diff_val;
        docClient.get(params, function(err, data){
            if(err) console.log(err)
            else if(data.Item !== undefined){
                diff_val = data.Item.diff_val;
                var params = {
                    TableName: "RankData",
                    Item: {
                        "title":  title,
                        "difficulty": difficulty,
                        "diff_val" : diff_val,
                        "rank":  element.rank
                    }
                };
        
                docClient.put(params, function(err, data) {
                if (err) {
                    console.error("Unable to add data", element.title, ". Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("PutItem succeeded:", element.title);
                }
                });
            }
        })
    });
}

function main(){
    console.log("Importing Data into DynamoDB. Please wait.");
    LoadData();
}

main();
