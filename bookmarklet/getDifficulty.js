let num_of_music = [40];
let diff_data = [];
let diff_name = ['BASIC', 'ADVANCED', 'EXTREME', 'MASTER'];
let intervalID = [40];

async function getDiff(idx_, cat_){
    return new Promise(resolve => {
        var url = "https://p.eagate.573.jp/game/gfdm/gitadora_nextage/p/eam/playdata/music_detail.html?gtype=dm&sid=2&index=" + idx_ + "&cat=" + cat_ + "&page=1";
        $.ajax({
            url: url,
            success: function (data) {
                var title = $(data).find('.live_title')[0].innerHTML;
                title.replace('&amp;', '&');
                var diffs = $(data).find('.diff_area');
                $.each(diffs, function (idx, val) {
                    var diff = val.innerHTML;
                    var arr = {
                        title: title,
                        difficulty: diff_name[idx],
                        diff_val: diff
                    };
                    diff_data.push(arr);
                });
            }
        });
        resolve();
    })
}

function timeout(index_, cat_){
    var url = "https://p.eagate.573.jp/game/gfdm/gitadora_nextage/p/eam/playdata/music_detail.html?gtype=dm&sid=2&index=" + index_ + "&cat=" + cat_ + "&page=1";
        $.ajax({
            url: url,
            success: function (data) {
                var title = $(data).find('.live_title')[0].innerHTML;
                var diffs = $(data).find('.diff_area');
                $.each(diffs, function (idx, val) {
                    var diff = val.innerHTML;
                    var arr = {
                        title: title,
                        difficulty: diff_name[idx],
                        diff_val: diff
                    };
                    diff_data.push(arr);
                });
            }
        });
    if(index_ >= num_of_music[cat_]-1) clearInterval(intervalID[cat_]); 
}

function getNumOfMusic(cat_){
    var url = "https://p.eagate.573.jp/game/gfdm/gitadora_nextage/p/eam/playdata/music.html?gtype=dm&cat="+cat_;
    return new Promise(resolve =>{
        $.ajax({
        url: url,
        success: function(data){
            num_of_music[cat_] = $(data).find('.music_cell').length;
            resolve();
        }
    })
    })
}

$(function(){
    main();
})

async function main(){
    for(let i = 0; i < 37; i++){
        await getNumOfMusic(i);
        console.log(i+1 + '/37');
        for(let j = 0; j < num_of_music[i]; j++){
            await getDiff(j, i);
            console.log(j+1 + '/' + num_of_music[i]);
        }
    }
    toJSON(diff_data);
}

function toJSON(_diffData){
    var JSONData = [];
    _diffData.forEach(function(val){
        JSONData.push(val);
    });
    var s = JSON.stringify(JSONData, null, '\t');
    var blob = new Blob([s], {type: 'text/plain'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = 'gitadora_diffdata.json';
    a.href = url;
    a.click();
}