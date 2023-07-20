const bgs = [
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#2c3e50',
  '#f39c12',
  '#d35400',
  '#c0392b',
  '#34495e'
];

$().ready(() => {
  $('.img-loader>img').on('load', (e)=>{
    $(e.target).animate({'opacity':1});
  });
  
  $('.confirm-action').on('click', (e) => {
    if(confirm("This will erase your progress, are you sure you want to continue?")) {
      return;
    }
    e.stopImmediatePropagation();
  });

  $('#start,.action-advance').on('click', ()=>{
    $('html').animate({backgroundColor: bgs[Math.floor(Math.random() * bgs.length)]});
  });

  $('.action-cancel').on('click', ()=>{
    $('html').animate({backgroundColor: '#1e1e1e'});
  });
});

function randint(max, min=0) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function submit_highscore(scope, score, username=null, secret=null, silent=false) {
  if(username==null) username = prompt("Username");
  if(!username) return false;
  if(secret==null) secret = prompt("Secret code (must be typed by the teacher)");
  if(!secret) return false;

  $.get(`https://highscore.yiays.com/?secret=${secret}&scope=${scope}&username=${username}&score=${score}`)
  .done((data) => { if(!silent) alert(data); showleaderboard(); })
  .fail((error) => { alert(error.responseText? error.responseText : "Something went wrong! Failed to save your highscore.")});
  return true;
}

function get_leaderboard(scope,
                         result_converter=(score) => `${score}%`,
                         sorter=(a, b) => parseInt(b[1]) - parseInt(a[1])) {
  $('#board>tbody').html('<tr><td colspan=3>Loading...</td></tr>')
  $.get(`https://highscore.yiays.com/?scope=${scope}`)
  .done((data) => {
    // Sort data using either a provided sorting algorithm, or the default
    var entries = Object.keys(data).map((key) => {
      return [key, result_converter(data[key]), data[key]];
    });
    entries.sort(sorter);

    $('#board>tbody').html('');
    let i = 0;
    entries.slice(0, 10).forEach(entry => {
      $('#board>tbody').append(`<tr><td>${++i}</td><td>${entry[0]}</td><td>${entry[1]}</td></tr>`);
    });
    if(i==0) $('#board>tbody').html('<tr><td colspan=3>No highscores yet, be the first!</td></tr>');
  })
  .fail(() => {alert("Failed to get the leaderboard!")});
}

// Shake plugin for JQuery - https://github.com/ninty9notout/jquery-shake
(function(d){d.fn.shake=function(a){"function"===typeof a&&(a={callback:a});a=d.extend({direction:"left",distance:20,times:3,speed:140,easing:"swing"},a);return this.each(function(){var b=d(this),k={position:b.css("position"),top:b.css("top"),bottom:b.css("bottom"),left:b.css("left"),right:b.css("right")};b.css("position","relative");var c="up"==a.direction||"down"==a.direction?"top":"left",e="up"==a.direction||"left"==a.direction?"pos":"neg",f={},g={},h={};f[c]=("pos"==e?"-=":"+=")+a.distance;g[c]=
("pos"==e?"+=":"-=")+2*a.distance;h[c]=("pos"==e?"-=":"+=")+2*a.distance;b.animate(f,a.speed,a.easing);for(c=1;c<a.times;c++)b.animate(g,a.speed,a.easing).animate(h,a.speed,a.easing);b.animate(g,a.speed,a.easing).animate(f,a.speed/2,a.easing,function(){b.css(k);a.callback&&a.callback.apply(this,arguments)})})}})(jQuery);