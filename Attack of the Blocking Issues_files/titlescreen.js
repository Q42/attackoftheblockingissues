var introText = [
  "They appear when you least expect...",
  "They need to be fixed immediately...",
  "Eventually, they come for everyone...",
  "And this time, they're coming for...",
];

var timeout;
var timeout2;
var flashStarted = false;

function showNextIntroText() {
  if (!flashStarted) {
    var fadeIn = 100;
    var fadeOut = 3790;
    var hold = 600;
    var pauze = 250;

    $('#intro').text(introText[0]);
    introText.splice(0, 1);
    $('#intro').fadeIn(fadeIn);
    if (introText.length > 0) {
      timeout = window.setTimeout(function () {
        $('#intro').fadeOut(fadeOut);
      }, hold);
      timeout = window.setTimeout(showNextIntroText, fadeIn + hold + fadeOut + pauze);
    }
    else {
      timeout = window.setTimeout(function () {
        //$('#url').text("your website!");
        $('#url').fadeIn(fadeIn);
        timeout = window.setTimeout(flash, 3090);
      }, 1400);
    }
  }
}

function flash() {
  if (!flashStarted) {
    flashStarted = true;
    $('#intro').hide();
    $('#flash').show();
    $('#tunnel').show();
    $('#titlescreen').show();
    $('#tunnel').attr('src', '/bg');
    window.setTimeout(function () {
      $('#flash').fadeOut(1950);
    }, 500);
  }
}

function startIntro() {
  //$("#music")[0].pause();

  timeout = window.setTimeout(showNextIntroText, 3300);

  if (location.hash == '#skip') {
    location.hash = '';
  }

  $("#high-scores-link").click(function (e) {
    $("#highscores").fadeIn();
    e.preventDefault();
  });

  $("#how-to-play-link").click(function (e) {
    $("#explanation").fadeIn();
    e.preventDefault();
  });

  $("#about-link").click(function (e) {
    $("#about").fadeIn();
    e.preventDefault();
  });

  $(".close").click(function (e) {
    $(this).parent().fadeOut();
    e.preventDefault();
  });

  $("#skip").delay(3000).fadeOut(5000);

  window.onhashchange = function (evt) {
    location.hash = '';
    window.clearTimeout(timeout);
    timeout = null;
    window.clearTimeout(timeout2);
    timeout2 = null;
    flash();
  };
}

function turnDownTheVolume() {
  var step = 0.005; // TODO: sjoerd laten fixen
  document.getElementById('music').volume = document.getElementById('music').volume - step;
  if (document.getElementById('music').volume > step) {
    window.setTimeout(turnDownTheVolume, 1);
  }
  else {
    $('#music').empty();
    var music = document.getElementById('music');
    var source = document.createElement('source');
    if (music.canPlayType('audio/mpeg;')) {
      source.type = 'audio/mpeg';
      source.src = '/media/The Son of Flynn.mp3';
    } else {
      source.type = 'audio/ogg';
      source.src = '/media/The Son of Flynn.ogg';
    }
    music.appendChild(source);
    $('#music').attr('src', '/media/The Son of Flynn.mp3');
    music.volume = 1;
  }
}

function switchMusic() {
  if ($('#music source').attr('src').indexOf('Grid') > -1) {
    window.setTimeout(turnDownTheVolume, 1);
  }
}

function checkWebGL() {
  if (!
		(function () {
		  try {
		    return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
		  } catch (e) {
		    return false;
		  }
		}
		)()
	) {
    document.body.className = 'nowebgl';
    return false;
  } else {
    return true;
  }
}

$(document).ready(function () {
  checkWebGL();
});