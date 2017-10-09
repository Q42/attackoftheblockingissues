ig.module(
	'game.EntityDOM'
)
.requires(
	'impact.game',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map',
	'impact.font'
)
.defines(function () {
  EntityDOM = ig.Entity.extend({

    size: { x: 16, y: 16 },
    maxVel: { x: 100, y: 300 },
    offset: { x: 0, y: 0 },
    speed: 42,
    collides: ig.Entity.COLLIDES.PASSIVE,
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,

    animSheet: null,

    init: function (x, y, settings) {
      var tag = this.getFragment(settings.str);

      this.animSheet = new ig.AnimationSheet(tag.dataURL, tag.w, tag.h);
      this.size = { x: tag.w, y: tag.h };

      this.anim = this.addAnim('idle', 1, [0]);
      this.vel.y = this.speed;

      x = settings.x || x;

      // set at -90 deg
      this.anim.angle = -90 * Math.PI / 180;

      this.parent(x, y, settings);

      this.pos.x = x;
      this.pos.y = y;
    },

    getRandomXPosition: function () {
      var xPositions = [70, 140, 210];
      return xPositions[~ ~(Math.random() * 3)];
    },

    ySpeedVariation: 0,
    xSpeedVariation: 0,
    oppositeDirection: Math.round(Math.random()),

    update: function () {
      this.parent();

      this.pos.y += 1.15 * this.ySpeedVariation * ig.momg.moveSpeedModifier;
      var xmov = Math.sin(this.pos.y * Math.PI / 180) * (0.5 + this.xSpeedVariation) * ig.momg.moveSpeedModifier;
      if (this.oppositeDirection) {
        this.pos.x -= xmov;
      } else {
        this.pos.x += xmov;
      }

      if (this.pos.x < 0) {
        this.pos.x = 0;
        this.oppositeDirection = !this.oppositeDirection;
      }
      else if (this.pos.x > ig.system.width - this.size.x) {
        this.pos.x = ig.system.width - this.size.x;
        this.oppositeDirection = !this.oppositeDirection;
      }

      if (this.pos.y > ig.momg.screen.y + 600) {
        this.die();
      }
    },

    getTagColor: function () {
      var color = "#fff";
      return color;
    },

    die: function () {
      this.kill();
    },

    getFragment: function (str) {
      var c = ig.$new('canvas');
      var font = 'Consolas, Menlo, "Courier New", monospace';
      var size = "bold 14px";
      var ctx = c.getContext('2d');
      var color = '#cfc';
      var fillColor = color || "#fff";
      ctx.font = size + " " + font;
      ctx.fillStyle = fillColor;

      var dataURL = getDataURL(str);

      function getDataURL(text) {
        ctx.clearRect(0, 0, c.width, c.height);
        var w = ctx.measureText(text).width;
        c.width = w; c.height = 16;
        ctx.font = size + " " + font;
        ctx.strokeStyle = "2px black";
        ctx.fillStyle = fillColor;
        ctx.strokeText(text, 0, 12);
        ctx.fillText(text, 0, 12);

        var dataURL = c.toDataURL("image/png");
        return { dataURL: dataURL, w: c.width, h: c.height };
      }

      return dataURL;
    }
  });

});