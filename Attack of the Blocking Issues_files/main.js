ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'game.DOMLevel',
	'game.EntityPlayer',
	'game.EntityDOM',
	'game.EntityBug',
  'game.EntityPlayerBullet'
)
.defines(function () {

  Game = ig.Game.extend({

    player: null,
    clearColor: 'rgb(0,0,0)',
    speed: 2,
    gameOver: false,
    map: [],
    score: 0,
    gameState: "paused",
    height: 256,
    width: 256,
    nodeQueue: [], // list of tags ready to spawn at update
    timer: null,
    domTimer: null, bugTimer: null, bulletTimer: null, gameSpeedTimer: null,
    domSpawnSpeed: 0.05,
    bugSpawnSpeed: 5,
    moveSpeedModifier: 1,
    bugsShot: 0,
    sounds: {},

    init: function () {
      ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
      ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
      ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
      ig.input.bind(ig.KEY.UP_ARROW, 'up');
      ig.input.bind(ig.KEY.ESC, 'esc');
      ig.input.bind(ig.KEY.SPACE, 'space');

      this.sounds = {
        "shoot": new ig.Sound('media/shoot.mp3'),
        "hit": new ig.Sound('media/hit.mp3'),
        "collision": new ig.Sound('media/collision.mp3'),
        "death": new ig.Sound('media/death.mp3')
      };

      $("#score").fadeIn();
      $("#health").fadeIn();

      this.setupPlayer();

      ig.momg = this; // set up a reference to our game
    },

    startGame: function () {
      $('#message').fadeIn(1500).delay(3000).fadeOut(1000);

      this.bugsShot = 0;
      domSpawnSpeed = 0.05;
      bugSpawnSpeed = 5;
      moveSpeedModifier = 1;
      GLResetSpeed();
      GLGameStart();
      ig.level = new DOMLevel();
      ig.level.load(this);
      this.gameState = "playing";
    },

    calcVariations: function () {
      this.ySpeedVariation = Math.random() + 1;
      this.xSpeedVariation = Math.random() * 5;
      this.oppositeDirection = Math.round(Math.random());
    },

    ySpeedVariation: Math.random() + 1,
    xSpeedVariation: Math.random() * 5,
    oppositeDirection: Math.round(Math.random()),

    update: function () {

      if (ig.input.state('esc')) {
        this.gameState = (this.gameState == "paused" ? "playing" : "paused");
      }

      if (this.gameState == "paused") {
        //this.parent();
        return;
      }

      this.timer += ig.system.tick
      this.domTimer += ig.system.tick;
      this.bugTimer += ig.system.tick;
      this.bulletTimer += ig.system.tick;
      this.gameSpeedTimer += ig.system.tick;

      if (ig.input.state('space') && this.bulletTimer > 0.2) {
        this.bulletTimer = 0;
        this.spawnEntity(EntityPlayerBullet, this.player.pos.x - 1, this.player.pos.y, null);
        this.spawnEntity(EntityPlayerBullet, this.player.pos.x + 19, this.player.pos.y, null);
        this.sounds.shoot.play();
      }

      /*if (this.timer>1) {
      console.info(~~(1/ig.system.tick) + " fps");
      }*/

      if (this.gameSpeedTimer > 13) {
        this.gameSpeedTimer = 0;
        this.domSpawnSpeed *= 0.9;
        this.bugSpawnSpeed *= 0.7;
        this.moveSpeedModifier *= 1.08;
        GLIncreaseSpeed();
      }

      if (this.bugTimer > this.bugSpawnSpeed) {
        this.spawnEntity(EntityBug, 0, -32, null);
        this.bugTimer = 0;
      }
      if (this.domTimer > this.domSpawnSpeed) {

        // always ensure there's at least one tag ready to be drawn
        if (this.nodeQueue.length == 0) {
          this.calcVariations();
          var str = this.getStr();
          var x = ~ ~(Math.random() * ig.system.width);
          if (str) {
            for (var i = str.length - 1; i >= 0; i--) {
              this.addToQueue(EntityDOM, { x: x, str: str[i] });
            }
          }
          this.domTimer = -1;
        } else {
          var item = this.nodeQueue.pop();
          if (item.settings && item.settings.str) {
            var entity = this.spawnEntity(item.entity, 0, -32, item.settings);
            entity.xSpeedVariation = this.xSpeedVariation;
            entity.ySpeedVariation = this.ySpeedVariation;
            entity.oppositeDirection = this.oppositeDirection;
            this.domTimer = 0;
          }
        }
      }

      $("#score-display").html(this.score);
      $("#health-display").html(this.player.health);

      this.parent();

      texture.needsUpdate = true;
      //mesh.position.x = Math.sin(this.timer*0.75) * 1000;
      renderer.render(scene, camera);
    },

    getStr: function () {

      return htmlString.getTag();

      var strings = [
				"<title>D-reizen</title>",
				'<a href="http://w00tcamp.nl">w00000t!!!</a>',
				"Solliciteer bij Q42!"
			];
      return strings[~ ~(Math.random() * strings.length)];
    },

    addToQueue: function (entity, settings) {
      this.nodeQueue.push({ entity: entity, settings: settings });
    },

    setupPlayer: function () {
      this.player = this.spawnEntity(EntityPlayer, 160, this.height - 48, {});
    }
  });

  var l = 0;
  var text = {
    nl: [
			"> Welkom gebruiker.",
			"> Met TAG_SURF bouw je spelenderwijs HTML documenten op.",
			"> Gebruik de pijltjestoetsen om door het semantische landschap te navigeren.",
			"> Elke tag die je raakt, wordt toegevoegd aan je document.",
			"> Als je een tag geopend hebt, kun je typen om content toe te voegen.",
			"> Je krijgt punten voor elke tag die je afsluit.",
			"> Druk op [spatie] om te beginnen."
		]
  };

  // only dutch for now
  text = text.nl;

  function type() {
    var val = text[0];
    var t = val.substr(0, l++);
    var wait = 40;
    if (t.indexOf(".") == t.length) {
      t = t.substr(0, t.length - 1) + "<br/>";
    }

    $("#welcome-text").html(t);

    if (l <= val.length) setTimeout(type, wait);
    else if (text.length > 1) { l = 0; text.shift(); setTimeout(type, wait * 30); }
    else {
      l = 0;
    }
  }
  type();

  // actually start the game logic
  ig.main('#canvas', Game, 60, 256, 256, 1);

  var camera = new THREE.PerspectiveCamera(75, 480 / 320, 0.001, 10000);
  camera.position.z = 1000;
  var scene = new THREE.Scene();
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(480, 320);

  var canvas = document.getElementById("canvas");

  var context = canvas.getContext("2d");

  context.fillStyle = "yellow";
  //context.fillRect(0, 0, 256, 256);
  context.strokeStyle = "red";
  context.lineWidth = "20";
  context.strokeRect(0, 0, 256, 256);


  // context.strokeStyle = "black";
  // context.strokeRect(0, 0, canvas.width, canvas.height);

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({
    map: texture
  });

  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width * 4, canvas.height * 4), material);
  // mesh.overdraw = true;
  // mesh.doubleSided = true;
  mesh.position.x = 0;
  mesh.position.y = -150;
  mesh.position.z = 100;

  mesh.rotation.x = -1;

  scene.add(mesh);

  renderer.render(scene, camera);

  canvas.parentNode.appendChild(renderer.domElement);
  renderer.domElement.id = "threed";


  // load the game when we press space	
  var loaded = false;

  $('#play').live("click", function () {
    ig.momg.startGame();
    loaded = true;
    $('#titlescreen').fadeOut();
    $('#gamebox').fadeIn();

    switchMusic();

  });

});