let CSVHeader = 'title,difficulty,diff_val,rank,\r\n';
let rankdata = [];

$(function(){
    $('body').append('<div class="overlay" style="position:fixed;top:0;width:100%;height:100%;background-color:yellow;opacity:0.9;overflow-y:auto"><div class="panel"><p style="font-size:28px;text-align:center;padding-top:5%;">プレーサイドを選択してください。</p><div class="radio" align="center" style="padding-top:5%"><input type="radio" name="type" value="GuiterFreaks" disabled><span style="margin-right:10%;font-size: 28px;">GuiterFreaks(未対応)</span><input type="radio" name="type" value="Drummania" checked><span style="font-size: 28px">Drummania</span></div><div class="button" style= "margin-left:45%;margin-top:5%;width:150px;height:70px;background-color:lightgreen;" onclick="start()"><p style="text-align:center;padding:15% 0%;font-size:20px;">データ取得</p></div></div></div>');
    console.log(isSmartPhone());
})

let songList = [18];

const rank_dic = {
    "SS" : 0,
    "S" : 1,
    "A" : 2,
    "B" : 3,
    "C" : 4,
    "-" : 5
};

function isSmartPhone() {  
    if (window.matchMedia('(max-device-width: 640px)').matches) {  
      return true;  
    } else {  
      return false;  
    }  
  }  

async function start(){
    $('head').append('<style>#summery{overflow-x:auto;}td{white-space:nowrap;}.sum_idx{width:60px;text-align:center;}.wrapper{margin:8%;}.back_white{background-color: white}.back_blue{background-color: lightgrey;}.BASIC{color: blue;}.ADVANCED{color: yellow;}.EXTREME{color: red;}.MASTER{color: purple;}#detail{overflow-x:auto}</style>');
    $('.panel').remove();
    $('.overlay').append('<div class="message"></div>');
    $('.message').append('<p style="font-size:28px;text-align:center;padding-top:5%;">データ取得中...</p>');
    for(var i = 0; i < 37; i++){
        await getRank(i);
        if(i!=0) $('.progress').remove();
        $('.message').append('<p class="progress" style="text-align:center">' + Number(i+1)  + ' / 37</p>')
        console.log(i+1 + '/37');
    }
    $('.message').empty();
    // スマホの時は display : flex をはずす
    if(isSmartPhone()) $('.overlay').append('<div class="wrapper"></div>');
    else $('.overlay').append('<div class="wrapper" style="display:flex"></div>');
    main();
}
function main(){
    $('.message').append('<p style="font-size:28px;text-align:center;padding-top:5%; class="loading">ロード中...</p>');
    $.ajax({
        url:'https://on50hyixaj.execute-api.ap-northeast-1.amazonaws.com/MyStage/pub',
        type:'POST',
        data:JSON.stringify(rankdata),
        success:function(data){
            console.log(data);
            $('.message').empty();
            $('.message').append('<p style="font-size:28px;text-align:center;padding-top:5%;">()内の数字はCLASSIC曲</p>')
            $('.wrapper').append('<div id="summery"></div>');
            $('#summery').append("<table id='summery_table'><tr class='back_blue' align='center'><td style='text-align:center;'>難易度値</td><td class='sum_idx'>SS</td><td class='sum_idx''>S</td><td class='sum_idx'>A</td><td class='sum_idx'>B</td><td class='sum_idx'>C</td><td style='text-align:center;'>NO PLAY</td></tr></table>");
            // スマホの時は 詳細表 の margin を切る
            if(isSmartPhone()) $('.wrapper').append('<div id="detail"></div>');
            else $('.wrapper').append('<div id="detail" style="margin-left:30px;"></div>');
            $('.overlay').append('<div class="button" style= "margin-left:45%;margin-top:5%;width:150px;height:70px;background-color:lightgreen;" onclick="toCSV(rankdata)"><p style="text-align:center;padding:15% 0%;font-size:20px;">.csv出力</p></div>');

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

            songData = data;

            songData.forEach(function(val, idx){
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
                var cl = "";
                if(idx % 2 == 1) var cl = 'class="back_blue"';
                else var cl = 'class="back_white"';
                var ap = '<tr ' + cl + ' align="right"><td>' + diff_min + ' ~ ' + diff_max + '</td>';
                Object.keys(val).forEach(function(key){
                    ap += '<td style="text-align:right" onclick="showDetail(' + diff_min + ',' + "'" + key + "'" + ')">' + val[key] + '(' + classic[idx][key] + ')</td>';
                })
                ap += '</tr>';
                $('#summery_table').append(ap);
            })
        },
        error:function(e){
            console.log(e);
            $('.loading').remove();
            $('.message').append('<p class="error">ロード中にエラーが発生しました。時間を置いてもう一度試してください。</p>')
        }
    });
};

function showDetail(_diff, _rank){
    $('#detail_table').remove();
    $('.not_found').remove();

    var i = (_diff - 1) / 0.5;
    var is_matched = false;
    var matched = [];
    songList[i].forEach(function(val,idx){
        if(rank_dic[val.rank] > rank_dic[_rank]){
            if(!is_matched){
                $('#detail').append("<table id='detail_table'><tr class='back_blue'><td style='text-align:center;'>タイトル</td><td style='text-align:center;'>難易度</td><td>難易度値</td><td style='text-align:center;width:75px;'>ランク</td><td style='text-align:center;width:75px;'>Youtube</td></tr></table>");
                is_matched = true;
            }
            var param = {
                title : val.title,
                difficulty : val.difficulty,
                diff_val : val.diff_val,
                rank : val.rank
            };
            matched.push(param);
        }
    })
    if(!is_matched) $('#detail').append('<p class="not_found">条件にマッチするデータがありません。</p>');
    matched.sort(function(a, b){if(a.diff_val > b.diff_val) return 1; if(a.diff_val < b.diff_val) return -1; else return 0;});
    matched.sort(function(a, b){if(rank_dic[a.rank] > rank_dic[b.rank]) return 1; if(rank_dic[a.rank] < rank_dic[b.rank]) return -1; else return 0;});
    matched.forEach(function(val, i){
        var idx = Number(i)+1;
        var link = 'https://www.youtube.com/results?search_query=gitadora+' + val.title;
        var cl = "";
        if(idx % 2 == 0) cl = 'class="back_blue"';
        else var cl = 'class="back_white"';
        var ap = '<tr ' + cl + '><td>' + val.title + '</td><td style="text-align:center;" class="' + val.difficulty + '">' + val.difficulty + '</td><td style="text-align:right;">' + val.diff_val +  '</td><td style="text-align:center;">' + val.rank + '</td><td style="text-align:center;"><a target="_blank" href=' + link + '>リンク</a>' + '</td></tr>';
        $('#detail_table').append(ap);
    })
}

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