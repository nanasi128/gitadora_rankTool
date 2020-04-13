$(main());

const rank_dic = {
    "SS" : 0,
    "S" : 1,
    "A" : 2,
    "B" : 3,
    "C" : 4,
    "-" : 5
};
let songList = [18];

function main(){
    $.ajax({
        url:'https://on50hyixaj.execute-api.ap-northeast-1.amazonaws.com/MyStage',
        success:function(data){
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
            try{ var songData = JSON.parse(data.body); }
            catch(e){ 
                main(); 
                return;
            }
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
                var ap = '<tr align="right"><td>' + diff_min + ' 〜 ' + diff_max + '</td>';
                Object.keys(val).forEach(function(key){
                    ap += '<td onclick="showDetail(' + diff_min + ',' + "'" + key + "'" + ')">' + val[key] + '(' + classic[idx][key] + ')</td>';
                })
                ap += '</tr>';
                $('#summery_table').append(ap);
            })
        }
    })
}

function showDetail(_diff, _rank){
    if($('#detail').find('#detail_table').length != 0){
        $('#detail_table').remove();
    }
    var i = (_diff - 1) / 0.5;
    var is_matched = false;
    var matched = [];
    songList[i].forEach(function(val){
        if(rank_dic[val.rank] > rank_dic[_rank]){
            if(!is_matched){
                $('#detail').append("<table id='detail_table' border='1'><tr><td>#</td><td>曲名</td><td>難易度</td><td>難易度値</td><td>ランク</td></tr></table>");
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
    if(!is_matched) $('#detail').append('<p>条件にマッチする譜面がありません。</p>');
    matched.sort(function(a, b){if(a.diff_val > b.diff_val) return 1; if(a.diff_val < b.diff_val) return -1; else return 0;});
    matched.sort(function(a, b){if(rank_dic[a.rank] > rank_dic[b.rank]) return 1; if(rank_dic[a.rank] < rank_dic[b.rank]) return -1; else return 0;});
    matched.forEach(function(val, i){
        var idx = Number(i)+1;
        var ap = '<tr><td>' + idx + '</td><td>' + val.title + '</td><td>' + val.difficulty + '</td><td>' + val.diff_val +  '</td><td>' + val.rank +  '</td></tr>';
        $('#detail_table').append(ap);
    })
}