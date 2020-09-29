let AWS = require("aws-sdk");

async function CreateTable(){
    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000"
    });
    
    let dynamodb = new AWS.DynamoDB();

    var params = {
        TableName : "DiffData"
    }
    try{
        await dynamodb.deleteTable(params).promise();
        console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    }catch(e){
        console.error("Unable to delete table. Error JSON:", JSON.stringify(e, null, 2));
    }
    var params = {
        TableName : "DiffData",
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
        console.error("Unable to create table. Error JSON:", JSON.stringify(e, null, 2));
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

async function main(){
    console.log("Importing Data into DynamoDB. Please wait.");

    await CreateTable();
    LoadData();
}

main();
