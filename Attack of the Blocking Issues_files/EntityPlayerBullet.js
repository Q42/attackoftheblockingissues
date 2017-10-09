ig.module(
	'game.EntityPlayerBullet'
)
.requires(
	'impact.game',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map',
	'impact.font'
)
.defines(function () {

  EntityPlayerBullet = ig.Entity.extend({

    size: { x: 4, y: 10 },
    maxVel: { x: 200, y: 300 },
    offset: { x: 0, y: 0 },
    speed: 300,
    collides: ig.Entity.COLLIDES.FIXED,
    friction: { x: 20, y: 0 },
    health: 5,
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    timer: 0,

    animSheet: new ig.AnimationSheet('media/bullet.png', 4, 10),

    init: function (x, y, settings) {
      this.addAnim('idle', 0.1, [0, 1, 2]);
      this.parent(x, y, settings);
    },

    collideWith: function (other, axis) {
      if (other instanceof EntityBug && !other.dying) {
        GLEnemyDestroyed(this.pos.x, this.pos.y, true);
        ig.momg.sounds.hit.play();
        other.die();
        this.die();
        ig.momg.score = Math.max(ig.momg.score + 100, 0);
        ig.momg.bugsShot++;
      }
      else if (other instanceof EntityDOM) {
        GLEnemyDestroyed(this.pos.x, this.pos.y, false);
        ig.momg.sounds.hit.play();
        other.die();
        this.die();
        ig.momg.score = Math.max(ig.momg.score - 25, 0);
      }
    },

    die: function () {
      this.kill();
    },

    update: function () {
      this.pos.y -= 10;
      this.parent();
    }
  });

});