ig.module(
	'game.EntityBug'
)
.requires(
	'impact.game',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map',
	'impact.font'
)
.defines(function () {
  EntityBug = ig.Entity.extend({

    size: { x: 16, y: 16 },
    maxVel: { x: 100, y: 300 },
    offset: { x: 0, y: 0 },
    speed: 42,
    collides: ig.Entity.COLLIDES.PASSIVE,
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    dying: false,
    dyingTimer: 0,

    animSheet: new ig.AnimationSheet('media/bug.png', 16, 16),

    init: function (x, y, settings) {

      this.addAnim('idle', 1, [0]);
      this.addAnim('exploding', 0.1, [1, 2, 3, 4, 5], true);

      this.anim = this.anims.idle;

      this.vel.y = this.speed;

      this.parent(x, y, settings);

      this.pos.x = this.getRandomXPosition();
      this.pos.y = y;

      this.ySpeedVariation = Math.random() + 1;
      this.oppositeDirection = Math.round(Math.random());
    },

    getRandomXPosition: function () {
      var xPositions = [70, 140, 210];
      return xPositions[~ ~(Math.random() * 3)];
    },

    ySpeedVariation: Math.random() + 1,
    oppositeDirection: false,

    update: function () {
      this.parent();

      if (this.dying) {
        this.dyingTimer += ig.system.tick;
        if (this.dyingTimer > 1) {
          this.kill();
        }
      }

      if (!this.dying) {
        this.pos.y += 1.15 * this.ySpeedVariation * ig.momg.moveSpeedModifier;
        var xmov = Math.sin(this.pos.y * Math.PI / 180) * 5 * ig.momg.moveSpeedModifier;
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
      }
    },

    die: function () {
      this.currentAnim = this.anims.exploding.rewind();
      this.dying = true;
    }
  });

});