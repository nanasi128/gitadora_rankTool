var AWS = require("aws-sdk");
var readlineSync = require("readline-sync");

AWS.config.update({
  region: "ap-northeast-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName : "RankData"
}

var songList = [18];
var rank = [];
var classic = [];
let rank_dic = {
    "SS" : 0,
    "S" : 1,
    "A" : 2,
    "B" : 3,
    "C" : 4,
    "-" : 5
};
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
        while(1){
            var req = readlineSync.question('Detail？(Type "q" to quit) -> ');
            if(req == 'q') break;
            else{
                if(!Number.isNaN(req)){
                    if(Number(req) % 0.5 == 0){
                        var i = (req - 1) / 0.5;
                        var req = readlineSync.question('Rank? -> ');
                        var r;
                        Object.keys(rank_dic).forEach(function(key){
                            if(req == key)
                                r = rank_dic[key];
                        })
                        if(r !== undefined){
                            var out = [];
                            var c = 0;
                            songList[i].forEach(function(val, idx){
                                if(rank_dic[val.rank] > r){
                                    out.push(val);
                                    var regex = /(CLASSIC)/;
                                    if(val.title.search(regex) !== -1) c++;
                                }
                            })
                            console.log();
                            if(c > 0) console.log('There are ' + out.length + ' song(s) you have not reached rank ' + req + ' yet.(' + c + ' classic song(s) included)');
                            else console.log('There are ' + out.length + ' song(s) you have not reached rank ' + req + ' yet.');
                            console.log();
                            out.sort(function(a, b){if(rank_dic[a.rank] > rank_dic[b.rank]) return 1; if(rank_dic[a.rank] < rank_dic[b.rank]) return -1; else return 0;});
                            out.forEach(function(val, idx){
                                console.log(val.title + '[' + val.difficulty + ']' + ' ' + val.rank);
                            })
                        }
                    }
                }
            }
        }
    }
})