ig.module(
	'game.EntityPlayer'
)
.requires(
	'impact.game',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map',
	'impact.font'
)
.defines(function () {

  EntityPlayer = ig.Entity.extend({

    size: { x: 24, y: 16 },
    maxVel: { x: 200, y: 300 },
    offset: { x: 0, y: 0 },
    speed: 150,
    collides: ig.Entity.COLLIDES.FIXED,
    friction: { x: 20, y: 0 },
    health: 100,
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    timer: 0,
    scoreTimer: 0,
    dying: false,
    dyingTimer: 0,

    animSheet: new ig.AnimationSheet('media/bughunter.png', 24, 16),

    init: function (x, y, settings) {
      this.addAnim('idle', 0.1, [0, 1, 2]);
      this.addAnim('moveLeft', 0.1, [3]);
      this.addAnim('moveRight', 0.1, [4]);
      this.addAnim('exploding', 0.1, [5, 6, 7, 8, 9, 10, 11], true);
      this.parent(x, y, settings);
    },

    collideWith: function (other, axis) {
      if (!this.dying) {
        if (other instanceof EntityBug && !other.dying) {
          GLDamage(this.pos.x, this.pos.y);
          ig.momg.sounds.collision.play();
          other.die();
          this.health = Math.max(this.health - 25, 0);
        }
        else if (other instanceof EntityDOM) {
          GLDamage(this.pos.x, this.pos.y);
          ig.momg.sounds.collision.play();
          other.die();
          //ig.momg.score = Math.max(ig.momg.score - 5, 0);
          this.health = Math.max(this.health - 1, 0);
        }
        if (this.health < 25) {
          GLLowHealth();
        }
        if (this.health == 0) {
          this.die();
        }
      }
    },

    die: function () {
      this.currentAnim = this.anims.exploding.rewind();
      ig.momg.sounds.death.play();

      this.dying = true;

      $("#score").fadeOut();
      $("#health").fadeOut();
      $("#score-display").html('');
      $("#health-display").html('');
    },

    update: function () {
      this.timer += ig.system.tick;
      this.scoreTimer += ig.system.tick;

      if (this.dying) {
        this.dyingTimer += ig.system.tick;
        if (this.dyingTimer > 2) {
          GLEnemyDestroyed(this.pos.x, this.pos.y, true);
          GLGameStop();
          this.kill();
          ig.system.stopRunLoop.call(ig.system);
          postScreen(ig.game.score, ig.momg.bugsShot);
          ig.main('#canvas', Game, 60, 256, 256, 1);
        }
      } else {

        if (this.scoreTimer >= 1) {
          this.scoreTimer = 0;
          ig.momg.score += 5;
        }

        if (ig.input.state('left')) {
          this.move(-7, 0);
          this.currentAnim = this.anims.moveLeft;
        }
        else if (ig.input.state('right')) {
          this.move(7, 0);
          this.currentAnim = this.anims.moveRight;
        } else {
          this.currentAnim = this.anims.idle;
        }
      }

      this.parent();
    },

    move: function (dx, dy) {
      this.pos.x = Math.max(0, Math.min(ig.system.width - this.size.x, this.pos.x + dx));
      this.pos.y = Math.max(ig.momg.screen.y, Math.min(ig.momg.screen.y + ig.system.height - ig.momg.player.size.y, this.pos.y + dy));
    }
  });

});