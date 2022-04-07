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

// Shake plugin for JQuery - https://github.com/ninty9notout/jquery-shake
(function(d){d.fn.shake=function(a){"function"===typeof a&&(a={callback:a});a=d.extend({direction:"left",distance:20,times:3,speed:140,easing:"swing"},a);return this.each(function(){var b=d(this),k={position:b.css("position"),top:b.css("top"),bottom:b.css("bottom"),left:b.css("left"),right:b.css("right")};b.css("position","relative");var c="up"==a.direction||"down"==a.direction?"top":"left",e="up"==a.direction||"left"==a.direction?"pos":"neg",f={},g={},h={};f[c]=("pos"==e?"-=":"+=")+a.distance;g[c]=
("pos"==e?"+=":"-=")+2*a.distance;h[c]=("pos"==e?"-=":"+=")+2*a.distance;b.animate(f,a.speed,a.easing);for(c=1;c<a.times;c++)b.animate(g,a.speed,a.easing).animate(h,a.speed,a.easing);b.animate(g,a.speed,a.easing).animate(f,a.speed/2,a.easing,function(){b.css(k);a.callback&&a.callback.apply(this,arguments)})})}})(jQuery);