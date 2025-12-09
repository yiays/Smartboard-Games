const c_schemes = {
  'default': [
    '16a085',
    '27ae60',
    '2980b9',
    '8e44ad',
    '2c3e50',
    'f39c12',
    'd35400',
    'c0392b',
    '34495e'
  ],
  'alice': [
    '8f55fa',
    '59ff00',
    'b3ff8a',
    'ff8af7',
    'ff00ee'
  ],
  'roses': [
    'a31212',
    '751919',
    '4e7b3a',
    '3e5e2f',
    '5f2e2e'
  ]
}

let username=null, secret=null, theme='default', keyboard=true, themeExpired=true;
if(document.cookie.includes('username=')) {
  username = document.cookie.split('; ').filter((s) => s.startsWith('username='))[0].slice(9);
}
if(document.cookie.includes('secret=')) {
  secret = document.cookie.split('; ').filter((s) => s.startsWith('secret='))[0].slice(7);
}
if(document.cookie.includes('theme=')) {
  theme = document.cookie.split('; ').filter((s) => s.startsWith('theme='))[0].slice(6);
  themeExpired = false;
}
if(document.cookie.includes('keyboard=')) {
  keyboard = document.cookie.split('; ').filter((s) => s.startsWith('keyboard='))[0].slice(9)=='1'?true:false;
}

const bc = new BroadcastChannel('general');
bc.onmessage = (e) => {
  let frag = e.data.split(' ');
  if(frag[0] == 'login') { // login broadcast event
    username = frag[1];
    secret = frag[2];
    theme = frag[3];
    complete_login(username, secret, theme, null, false, false);
    toasty("Logged in successfully", 10)
  }
};

let myService, newService;
// Service Worker Registration
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
  .then(reg => {
    myService = reg.active;
    // Get the current version, show it in any .ver elements
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => {
      document.querySelectorAll('.ver').forEach(el => {
        el.textContent = e.data.version;
      })
    };
    reg.active.postMessage(
      {type: 'GET_VER'},
      [channel.port2]
    );

    // Detect pending update
    if(reg.waiting) {
      console.log("SWReload is already wating");
      toasty("An update is available!", 0, false, "Install", 'applyUpdate()');
    }
    // Detect update as it's being downloaded
    reg.addEventListener('updatefound', () => {
      newService = reg.installing;
      newService.addEventListener('statechange', () => {
        if(newService.state == 'installed') {
          console.log("SWReload is waiting now after being installed");
          toasty("An update is available!", 0, false, "Install", 'applyUpdate()');
        }
      });
    });
    // Handle when the service worker itself has indicated an update is waiting
    navigator.serviceWorker.addEventListener('message', (e) => {
      if(e.data && e.data.type == 'NEW_SW_WAITING') {
        console.log("Update detected because serviceWorker announced it");
        toasty("An update is available!", 0, false, "Install", 'applyUpdate()');
      }
    })
  });
} else {
  console.warn('Service Worker is not supported in this browser.');
}

// Apply update and reload logic
function applyUpdate() {
  (newService?newService:myService).postMessage({type: 'SKIP_WAITING'});
  location.reload();
}

$().ready(() => {
  if(username && secret) {
    if(themeExpired)
      log_in(username, secret);
    else
      complete_login(username, secret, theme);
  }

  if(!navigator.onLine) {
    document.body.classList.add('offline');
  }

  window.addEventListener('online', (e) => {
    document.body.classList.remove('offline');
    if(username && secret && themeExpired)
      log_in(username, secret);
  });

  window.addEventListener('offline', (e) => {
    document.body.classList.add('offline');
  });

  $('.media-loader>*').on('load', (e)=>{
    $(e.target).parent().addClass('loaded');
  });
  
  $('.media-loader>*').on('canplay', (e)=>{
    $(e.target).parent().addClass('loaded');
  });
  
  $('.confirm-action').on('click', (e) => {
    if(confirm("This will erase your progress, are you sure you want to continue?")) {
      return;
    }
    e.stopImmediatePropagation();
  });

  $('#start,.action-advance').on('click', advance_colour);
  $('.action-cancel').on('click', reset_colour);
});

let currentCol = '1a547a';
let colSetter = null;
function set_colour(colour) {
  if(colSetter) clearInterval(colSetter);
  var start = new Date();
  colSetter = setInterval(() => {
    if(((new Date()) - start) >= 1000) {
      $('html').css('--theme', '#'+colour);
      currentCol = colour;
      clearInterval(colSetter);
      return;
    }
    $('html').css('--theme', '#'+colour_interpolate(currentCol, colour, ((new Date()) - start) / 1000));
  }, 1000/30);
}
function advance_colour() {
  var newCol = c_schemes[theme][Math.floor(Math.random() * c_schemes[theme].length)];
  set_colour(newCol);
}
function reset_colour() {
  set_colour('1a547a');
}

// Source - https://stackoverflow.com/a
// Posted by bryc, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-08, License - CC BY-SA 4.0

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function randint(max, min=0, random=undefined) {
  if(random === undefined) random = Math.random;
  return Math.floor(random() * (max - min + 1) + min);
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

function sign_up(pusername, callback=null) {
  if(pusername.match(/[\w\d]{3,15}/)) {
    $.post('https://highscore.yiays.com/', {'username':pusername})
    .done((data) => {
      complete_login(pusername, data.secret, data.theme, callback, true);
      toasty(`Your secret code is ${data.secret}. Note this down in order to be able to sign in later.`, 0);
    })
    .fail((error) => toasty(error.responseText? error.responseText : "Unable create an account at this time.", 20, true))
  }else{
    toasty("This username doesn't fit the required criteria! (3+ characters, letters and numbers only)", 20, true);
    return false;
  }
}

function log_in(pusername=null, psecret=null, callback=null) {
  if(pusername==null) pusername = prompt('Username').toLowerCase();
  if(!pusername) return false;
  if(psecret==null) psecret = prompt('Secret (check account page on signed in device for secret)');
  if(!psecret) return false;

  pusername = encodeURIComponent(pusername);
  psecret = encodeURIComponent(psecret);

  $.get(`https://highscore.yiays.com/?secret=${psecret}&username=${pusername}`)
  .done((data) => complete_login(pusername, data.secret, data.theme, callback, true))
  .fail((error) => {
    if(error.status == 401) sign_up(pusername, callback);
    else toasty(error.responseText? error.responseText : "Unable to log you in at this time.", 20, true);
  });
}

function complete_login(pusername, psecret, ptheme, callback=null, online=false, broadcast=true) {
  // Saves retrieved info to cookies and updates ui
  if(online) {
    // This information is authoritative, so reset the cookies
    var expiry = new Date();
    expiry.setTime(expiry.getTime() + (1000*60*60*24*365*4)); // expires in 4 years
    var themeExpiry = new Date();
    themeExpiry.setTime(themeExpiry.getTime() + (1000*60*60*48)); // expires in 48 hours
    document.cookie=`username=${pusername};expires=${expiry.toUTCString()};path=/`;
    document.cookie=`secret=${psecret};expires=${expiry.toUTCString()};path=/`;
    document.cookie=`theme=${ptheme};expires=${themeExpiry.toUTCString()};path=/`;
  }

  username=pusername
  $('#showname').text(`Username: ${pusername}`);
  $('[data-username]').attr('data-username', pusername);

  secret=psecret;
  $('#showsecret').html(`Secret: <span class="spoiler">${psecret}</span>`);

  theme = ptheme;
  $('#theme').val(ptheme);

  $('#login').hide();
  $('#profile').show();

  advance_colour();
  
  // Inform other open tabs of the new login status
  if(broadcast) bc.postMessage(`login ${username} ${secret} ${theme}`);

  if(callback !== null) callback();
}

function log_out() {
  document.cookie = 'username=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
  username = null;
  document.cookie = 'secret=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
  secret = null;
  document.cookie = 'theme=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
  theme = 'default';

  $('#profile').hide();
  $('#login').show();

  reset_colour();
}

function submit_highscore(scope, score, silent=false) {
  if(username === null || secret === null) {
    if(confirm("You need to make an account first! Continue?"))
      window.open("/profile.html", '_blank');
    return false;
  }

  $.get(`https://highscore.yiays.com/?secret=${secret}&scope=${scope}&username=${username}&score=${score}`)
  .done((data) => { if(!silent) toasty(data, 10); showleaderboard(); })
  .fail((error) => {
    if(error.status == 403) log_out();
    toasty(error.responseText? error.responseText : "Something went wrong! Failed to save your highscore.", 20, true);
  });
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
  .fail(() => toasty("Failed to get the leaderboard!", 20, true));
}

// Toasty
let toastyId = 0;
function toasty(msg, expiry=5, error=false, btnLabel=false, btnAction=false) {
  var id = toastyId++;
  // Create toasty
  $(document.body).append(`
    <div class="toasty ${expiry>0?'finite':''} ${error?'error':''}" id="toasty-${id}" style="--expiry:${expiry}s;--id:${id};">
      ${msg}
      ${btnLabel?`<button type="button" class="btn" onClick="${btnAction}">${btnLabel}</button>`:''}
      <a class="close">×</a>
    </div>`);
  // Add event listener for close button
  $(`#toasty-${id}>.close`).on('click', () => {
    $(`#toasty-${id}`).addClass('finite').css('--expiry', '250ms');
    setTimeout(() => {
      $(`#toasty-${id}`).remove();
    }, 250);
  });
  // Schedule deletion
  if(expiry > 0)
    setTimeout(() => {
      $(`#toasty-${id}`).remove();
    }, expiry*1000);
  return id;
}

function clearToasty(id) {
  $(`#toasty-${id}`).remove();
}

// Update view when loading is complete
function load_complete(showcls='.big-red.btn') {
  $('.loader').hide();
  $(showcls).show();
}

// Pops up the keyboard as long as it wasn't manually disabled before
function popup_keyboard() {
  if(keyboard) {
    document.body.classList.add('keyboard');
  }
}
// Shows or hides the in-game keyboard
function toggle_keyboard() {
  var expiry = new Date();
  expiry.setTime(expiry.getTime() + (1000*60*60*24*30)); // expires in 1 month
  if(document.body.classList.contains('keyboard')) {
    document.body.classList.remove('keyboard');
    document.cookie=`keyboard=0;expires=${expiry.toUTCString()};path=/`;
    keyboard = false;
  }
  else {
    document.body.classList.add('keyboard');
    document.cookie=`keyboard=1;expires=${expiry.toUTCString()};path=/`;
    keyboard = true;
  }
}
// Takes input from the physical keyboard and sends it to type() and untype()
function init_keyboard_capture(charset=/[A-Za-z]/i) {
  $(document).on('keydown', (e) => {
    if($('#game').css('display') == 'none' || e.ctrlKey || e.altKey || e.metaKey) return;
    if(e.key.length === 1 && e.key.match(charset)) {
      e.stopImmediatePropagation();
      type(e.key.toUpperCase());
    }
    else if(e.key == 'Backspace') {
      e.preventDefault();
      e.stopImmediatePropagation();
      untype();
      return false;
    }
    else if(e.key == 'Enter') {
      e.preventDefault();
      e.stopImmediatePropagation();
      checkanswer();
      return false;
    }
  });
}

// Fraction simplification and presentation - https://codepen.io/yiays/pen/dyQweVg
// Mathematically find the fraction
function getlowestfraction(x0) {
  // Searches for the best fitting fraction down to `eps` precision
  // https://stackoverflow.com/a/14011299
  var eps = 1.0E-6;
  var h, h1, h2, k, k1, k2, a, x;
  x = x0;
  a = Math.floor(x);
  h1 = 1;
  k1 = 0;
  h = a;
  k = 1;
  while (x-a > eps*k*k) {
    x = 1/(x-a);
    a = Math.floor(x);
    h2 = h1; h1 = h;
    k2 = k1; k1 = k;
    h = h2 + a*h1;
    k = k2 + a*k1;
  }
  return [h, k];
}

// Represent fractions in html
function fraction_representation(number) {
  if(number === 0) return '0';
  var num = number, n, d, w;
  if(number < 0)
    num = Math.abs(number);
  if(num%1 !== 0) {
    [n,d] = getlowestfraction(num % 1);
    w = Math.max(`${n}`.length, `${d}`.length) / 3;
  }
  var sign = number < 0 ? '-' : '';
  var numRep = Math.floor(num) ? `${Math.floor(num)}` : '';
  var fracRep = n?`<span class="fraction" style="width:${w}em" data-num="${n}" data-denom="${d}">${n}/${d}</span>`:'';
  return sign+numRep+(numRep&&fracRep?'+':'')+fracRep;
}

// Shake function to handle being called too frequently
shaketimer = null
function shake(target) {
  if(shaketimer === null) {
    target.addClass('shake');
    shaketimer = setTimeout(() => {
      shaketimer=null;
      target.removeClass('shake');
    }, 300);
  }
}

// Colour interpolation - 
function colour_interpolate(col1, col2, p) {
  const rgb1 = parseInt(col1, 16);
  const rgb2 = parseInt(col2, 16);

  const [r1, g1, b1] = colour_toArray(rgb1);
  const [r2, g2, b2] = colour_toArray(rgb2);

  const q = 1-p;
  const rr = Math.round(r1 * q + r2 * p);
  const rg = Math.round(g1 * q + g2 * p);
  const rb = Math.round(b1 * q + b2 * p);

  return  Number((rr << 16) + (rg << 8) + rb).toString(16);
}
function colour_toArray(rgb) {
  const r = rgb >> 16;
  const g = (rgb >> 8) % 256;
  const b = rgb % 256;

  return [r, g, b];
}

// https://www.30secondsofcode.org/js/s/levenshtein-distance/
function levenshteinDistance(a, b, log=false) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const arr = [];
  for (let i = 0; i <= b.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= a.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
            );
    }
  }

  if(log) {
    // Approximately guesses which changes the levenschtein algorithm found
    let i = b.length;
    let j = a.length;
    
    const edits = {};
    
    while (i > 0 || j > 0) {
      if (i === 0) {
        edits[j-1] = `-${a[j-1]}`;
        j--;
      } else if (j === 0) {
        edits[i-1] = `+${b[i-1]}`;
        i--;
      } else if (arr[i-1][j-1] <= arr[i-1][j] && arr[i-1][j-1] <= arr[i][j-1]) {
        if (arr[i-1][j-1] < arr[i][j]) {
          edits[j-1] = `~${a[j-1]}${b[i-1]}`;
        }
        i--;
        j--;
      } else if (arr[i-1][j] <= arr[i][j-1]) {
        edits[j-1] = `-${a[j-1]}`;
        j--;
      } else {
        edits[i-1] = `+${b[i-1]}`;
        i--;
      }
    }
    
    return [arr[b.length][a.length], edits];
  }

  return arr[b.length][a.length];
};