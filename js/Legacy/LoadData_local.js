let AWS = require("aws-sdk");

async function CreateTable(){
    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000"
    });
    
    let dynamodb = new AWS.DynamoDB();

    var params = {
        TableName : "RankData"
    }
    try{
        await dynamodb.deleteTable(params).promise();
        console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    }catch(e){
        if(e) console.error("Unable to delete table. Error JSON:", JSON.stringify(e, null, 2));
    }
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
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    };

    try{
        await dynamodb.createTable(params).promise();
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }catch(e){
        if(e) console.error("Unable to create table. Error JSON:", JSON.stringify(e, null, 2));
    }
}

function LoadData(){
    let AWS = require("aws-sdk");
    let fs = require('fs');

    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000"
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

async function main(){
    console.log("Importing Data into DynamoDB. Please wait.");

    await CreateTable();
    LoadData();
}

main();
