let CSVHeader = 'title,difficulty,rank,\r\n';
let rankdata = [];

$(function(){
    main();
})

async function main(){
    for(var i = 0; i < 37; i++){
        await getRank(i);
        console.log(i+1 + '/37');
    }
    $.ajax({
        url:"https://on50hyixaj.execute-api.ap-northeast-1.amazonaws.com/MyStage",
        type:'POST',
        data:JSON.stringify(rankdata),
        success:function(data){ console.log(data)},
        error: function(e){ console.log(e)}
    })
    toJSON(rankdata);
};

function getRank(cat_){
    const URL = 'https://p.eagate.573.jp/game/gfdm/gitadora_nextage/p/eam/playdata/music.html?gtype=dm&cat='; // &cat=1
    var diff_name = ['BASIC', 'ADVANCED', 'EXTREME', 'MASTER'];
    return new Promise(resolve =>{
        $.ajax({
        url: URL + cat_,
        success: function(data){
            var rank_box = $(data).find('.score_data_rank');
            var titles = $(data).find('.title_box');
            $.each(titles, function(idx, val){
                for(var j = 0; j < 4; j++){
                    var temp = rank_box[4*idx+j].className.split(' ');
                    var rank = temp[2];
                    rank = rank.substring(4);
                    var title_ = val.childNodes[1].innerHTML;
                    var title = title_.substr(4, title_.length-8);
                    title = title.replace('&amp;', '&');
                    var arr = {title: title, difficulty: diff_name[j], rank: rank};
                    rankdata.push(arr);
                }
            })
            resolve();
        }
    })
})
}

function toCSV(_scoreData){
    var csvData = CSVHeader;
    for(var i = 0; i < _scoreData.length; i++){
        _scoreData[i]["title"] = '"' + _scoreData[i]["title"] + '"';
        var cache = Object.values(_scoreData[i]).join() + '\r\n';
        csvData += cache;
    }
    var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    var blob = new Blob([bom, csvData], {type: 'text/csv'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = 'gitadora_rankdata.csv';
    a.href = url;
    a.click();
}

function toJSON(_scoreData){
    var JSONData = [];
    _scoreData.forEach(function(val){
        JSONData.push(val);
    });
    var s = JSON.stringify(JSONData, null, '\t');
    var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    var blob = new Blob([s], {type: 'text/plain'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = 'gitadora_rankdata.json';
    a.href = url;
    a.click();
}