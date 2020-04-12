let AWS = require("aws-sdk");

function LoadData(){
    let AWS = require("aws-sdk");
    let fs = require('fs');

    AWS.config.update({
        region: "ap-northeast-1"
    });

    let docClient = new AWS.DynamoDB.DocumentClient();

    var rankdata = JSON.parse(fs.readFileSync('gitadora_diffdata.json', 'utf8'));
    rankdata.forEach(function(element) {
        var title = element.title;
        var params = {
            TableName: "DiffData",
            Item: {
                "title":  title,
                "difficulty": element.difficulty,
                "diff_val":  element.diff_val
            }
        };

        docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add data", element.title, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", element.title);
        }
        });
    });
}


console.log("Importing Data into DynamoDB. Please wait.");
LoadData();
