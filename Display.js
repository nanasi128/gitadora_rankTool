var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName : "RankData"
}

var songList = [18];
var rank = [];
var classic = [];
for(var i = 0; i < 18; i++){
    var o = {
        "SS" : 0,
        "S" : 0,
        "A" : 0,
        "B" : 0,
        "C" : 0,
        "-" : 0
    };
    var oo = {
        "SS" : 0,
        "S" : 0,
        "A" : 0,
        "B" : 0,
        "C" : 0,
        "-" : 0
    };
    rank.push(o);
    classic.push(oo);
    songList[i] = [];
}
var cnt = 0;
//console.log(classic)
docClient.scan(params, function(err, data){
    if(err){
        console.log(err);
    }else{
        data.Items.forEach(function(val){
            for(var i = 0; i < 18; i++){
                if(val.diff_val < 1.5 + 0.5*i){
                    var params = {
                        title : val.title,
                        difficulty : val.difficulty,
                        diff_val : val.diff_val,
                        rank : val.rank
                    }
                    songList[i].push(params);
                    rank[i][val.rank]++;
                    cnt++;
                    r = /(CLASSIC)/;
                    if(val.title.search(r) !== -1) {
                        classic[i][val.rank]++;
                    }
                    break;
                }
            }
        })
        rank.forEach(function(val, idx){
            var diff_min = Number(1 + idx * 0.5);
            var diff_max = Number(1.5 + idx * 0.5);
            if(diff_min % 1 == 0) diff_min = diff_min + '.00';
            else diff_min = diff_min + '0';
            diff_max -= 0.01;

            console.log(diff_min + ' 〜 ' + diff_max);
            Object.keys(val).forEach(function(key){
                console.log(key + ': ' + val[key] + '(' + classic[idx][key] + ')');
            })
        })
    }
})