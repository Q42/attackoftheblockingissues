ig.module(
	'game.DOMLevel'
)
.requires(
	'impact.game',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map'
)
.defines(function(){

DOMLevel = ig.Class.extend({

	init: function(tags) {
	},
	
	load: function(game) {
		game.addToQueue(EntityDOM);
	}
});
});