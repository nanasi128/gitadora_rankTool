var AWS = require("aws-sdk");

CreateTable();

function CreateTable(){
    AWS.config.update({
        region: "ap-northeast-1"
    });
    
    let dynamodb = new AWS.DynamoDB();
    
    var params = {
        TableName : "RankData",
        KeySchema: [       
            { AttributeName: "title", KeyType: "HASH"},  //Partition key
            { AttributeName: "difficulty", KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [       
            { AttributeName: "title", AttributeType: "S" },
            { AttributeName: "difficulty", AttributeType: "S" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 20, 
            WriteCapacityUnits: 20
        }
    };

    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}