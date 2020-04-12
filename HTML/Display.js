$(main());

function main(){
    $.ajax({
        url:'https://on50hyixaj.execute-api.ap-northeast-1.amazonaws.com/MyStage',
        success:function(data){
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
                    ap += '<td>' + val[key] + '(' + classic[idx][key] + ')</td>';
                })
                ap += '</tr>';
                $('#summery_table').append(ap);
            })
        }
    })
}