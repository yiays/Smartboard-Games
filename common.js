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