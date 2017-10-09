//BUGHUNTER - WebGL part
//By marcel@q42.nl, 2011, http://www.q42.com/
//Using J3D.js by Bartek Drozdz, https://github.com/drojdjou/J3D

//Bughunter is made by Rahul, Chris, Bob & me.

var speed = 12,            //game speed
	starspeed=40/(speed/10), //higher is slower
	tv=1,                    //tv effect
	glasses=1,               //enable 3d glasses
	shift=0.015,             //red/blue shift
	sky=1,                   //show stars
	showtunnel=1,            //show tunnel
	qualitytogglefps = 45;   //2-step numrendering toggle

var engine, cube, light,
	plane,tunnel,shader,shaderwall,
	stars,stars2,
	starsb,stars2b,
	post,
	mx,my,
	error,
	_fx1,_fx2,_tv;

var textures={},
	sdepth=400,
	lowhealth=false,
	started=false,
	shaders={},
	camrot=-0.15,
	fx1=0,
	fx2=0,
	lowquality = 0,
	ptime=(new Date()).getTime(),
	fd=0,
	avr=60,
	srunning=0,
	quality = window.location.href.replace(/^.*q=(\d).*$/,'$1'),
	goggles = window.location.href.replace(/^.*3d=(\d).*$/,'$1');

resolution=isNaN(quality)?2:quality;
glasses=tv?(isNaN(goggles)?glasses:goggles==1):0;
sky=glasses?0:sky;

var numStars = quality==2?5000:10000;

function r(){return Math.random()};
function debug(id,val){document.getElementById('_'+id).textContent=val};

window.onload = function() {
	initGameHooks();
	if(!checkWebGL()) return;
	
	engine = new J3D.Engine(null,{resolution:resolution});	
	
	textures.wall = new J3D.Texture('road.png');
	textures.light = new J3D.Texture('light.png');

	var tshsrc = document.getElementById("TunnelFilter").firstChild.nodeValue;
	shader = new J3D.ShaderUtil.parseGLSL(tshsrc);
	shader.su.uSpeed = speed/10;
	
	shaders = {
		wall: shader,
		outer: shader.clone(),
		roadside: shader,
		road: shader.clone()
	};

	engine.setClearColor(J3D.Color.black);
	
	ambient = new J3D.Transform();
	ambient.light = new J3D.Light(J3D.AMBIENT);
	ambient.light.color = new J3D.Color(0.5, 0.5, 0.5, 1);
	
	light = new J3D.Transform();
	light.light = new J3D.Light(J3D.DIRECT);
	light.light.color = new J3D.Color(0.5, 0.5, 0.5, 1);
	light.light.direction = new v3(1, 0, 1).norm();
	
	camera = new J3D.Transform();
	camera.camera = new J3D.Camera({
		near: 0,
		fov: 60
	});
	camera.position.z = 0;
	camera.position.y = -0.35;
	camera.rotation.x= camrot;
	engine.camera = camera;
	
	engine.scene.add(camera);
	
	if(sky) {
		stars = new J3D.Transform();
		
		var shsrc = document.getElementById("particleShader").firstChild.nodeValue;
		stars.renderer = new J3D.ShaderUtil.parseGLSL(shsrc);
		stars.renderer.reloadStaticUniforms = true;
		stars.renderer.drawMode = gl.POINTS;
		stars.renderer.speed = speed/10;
		stars.renderer.speed = 1;
			
		var a = Math.round(numStars/2);
		stars.geometry = new J3D.Geometry();
		stars.geometry.addArray("aVertexPosition", J3D.ParticleUtil.insideCube(a, sdepth), 3);
		stars.geometry.addArray("aVertexColor", J3D.ParticleUtil.randomColors(a, 0.5), 4);
		stars.renderer.uColor = new J3D.Color(3,3,2,1);
		
		stars2=stars.clone();
		stars2.geometry = new J3D.Geometry();
		stars2.geometry.addArray("aVertexPosition", J3D.ParticleUtil.insideCube(a, sdepth), 3);
		stars2.geometry.addArray("aVertexColor", J3D.ParticleUtil.randomColors(a, 0.5), 4);
		stars2.renderer.uColor = new J3D.Color(3,3,2,1);
		stars2.position.z=-sdepth;

		engine.scene.add(stars,stars2);
	}

	if(showtunnel) {
		tunnel = new Tunnel();
		engine.scene.add(tunnel.J3D)
	}

	engine.scene.add(light, ambient);

	if(tv) {
		post = new J3D.Postprocess(engine);
		var shstring = J3D.ShaderSource.CommonFilterInclude;
		shstring += document.getElementById("TVFilter").firstChild.nodeValue;
		post.filter = new J3D.Shader("TV", J3D.ShaderSource.BasicFilterVertex, shstring)
	}
	else post=engine;
		
	setGameHooks();
	
	draw();

	_tv = engine.shaderAtlas.shaders["TV"];

	if(glasses)
		gl.uniform1f(gl.getUniformLocation(_tv,"glasses"),true);
		
	_fx1 = gl.getUniformLocation(_tv,"fx1");
	_fx2 = gl.getUniformLocation(_tv,"fx2")
};

function draw() {
	if(error) return;
	try {
		var delta = Math.PI * J3D.Time.deltaTime / 6000;

		if(showtunnel) tunnel.step(delta);
	
		if(sky) {
			var sdelta = J3D.Time.deltaTime / starspeed;
			stars.position.z+= sdelta;
			stars2.position.z+= sdelta;
			if(stars.position.z>sdepth)stars.position.z=-sdepth;
			if(stars2.position.z>sdepth)stars2.position.z=-sdepth;
		}

		if(fx1>0)gl.uniform1f(_fx1,(fx1-=4)/120);
		if(fx2>0)gl.uniform1f(_fx2,(fx2-=4)/120);
		
		if(tv) {
			var red = Math.abs(Math.sin(speed/(lowhealth?2:10)*J3D.Time.time))*(lowhealth?1:0.4)*speed/30;
			var blue = Math.abs(Math.cos(speed/10*J3D.Time.time))*0.4*(speed/30);
			var green = fx1/100;
			gl.uniform3f(gl.getUniformLocation(engine.shaderAtlas.shaders["TV"],"uColor"),red,green,blue)
		}
		try {
			post.render()
		}
		catch(e) {
			if(tv) {
				tv=false,
				glasses=false,
				post=engine
			}
			else throw new Error(e)
		}
		
		var now = (new Date()).getTime();
		if(now>ptime+1000) {
			ptime=now,
			avr+=fd,
			fd=0,
			srunning++;
			if(srunning%2==0){
				avr/=3;
				if(lowquality<2&&avr<qualitytogglefps)tunnel.setLQ(lowquality++);
				else if(lowquality>0&&avr>=qualitytogglefps)lowquality--
			}
		}
		fd++;

		requestAnimationFrame(draw)
	}
	catch(e) {
		error=true;
		throw new Error(e)
	}
};

function Tunnel(layers) {
	layers=!isNaN(Number(layers))?Number(layers):18;

	var tunnel = new J3D.Transform(),
		iteration=0,
		index = 0,
		remove=0,
		generated=false,
		segments=10,
		col = [1,1,1,1],
		rnd=0,
		sel=0;
	
	this.__defineGetter__('J3D',function() {
		if(!generated&&(generated=true)) for(var i=0;i<layers;i++) {
			var ring = (new Ring(1,segments,i)).generate();
			ring.position.z=-1*i;
			beamCycle(ring);
			tunnel.add(ring);
			if(!glasses)colorCycle(ring)
		}
		return tunnel
	});
	
	function colorCycle(seg){
		col[0]=1+Math.cos(Math.PI*(1+iteration*0.02));
		col[1]=1+Math.sin(Math.PI*(iteration*0.01));
		col[2]=1+Math.sin(Math.PI*(iteration*0.001));
		seg.meta.setColor(col[0],col[1],col[2],1)
	};
	
	function beamCycle(ring){
		if(lowquality==2)return;
		if(rnd--<0)rnd=r()*30+20*(speed/30),sel=Math.round(r())==0;
		if(sel)rnd+=0.2;
		var walls=ring.meta.walls;
		for(var x in walls) {
			if(lowquality==1&&walls[x].type=='outer')continue;
			walls[x].enabled=(Math.round(r()*(20/speed)*0.5)==0)
		}
	};
	
	this.step = function(delta) {
		tunnel.position.z+=delta*speed;
		var z,ring = tunnel.childAt(index);
		while((z = tunnel.position.z+ring.position.z)>2){
			ring.position.z = -layers-iteration;
			index=++iteration%layers;
			if(!glasses)colorCycle(ring);
			beamCycle(ring);
			ring=tunnel.childAt(index)
		}
	};
	
	this.setLQ = function(){
		for(var i=0;i<tunnel.numChildren;i++)
			tunnel.childAt(i).meta.setLQ()
	};
	
	var shown=true;
	this.shown = function(b) {
		if(b!==shown) {
			tunnel.enabled = (shown=b);
			for(var i=0;i<tunnel.numChildren;i++)
				for(var j=0;j<tunnel.childAt(i).numChildren;j++)
					tunnel.childAt(i).childAt(j).enabled = shown
		}
	}
};

function Ring(size,segments,index){
	segments=!isNaN(Number(segments))?Number(segments):10;
	size=!isNaN(Number(size))?Number(size):1;
	var circumf = 2*Math.PI*(size/2),
		sps = (circumf/segments)*2.06,
		walls = [],
		roadRender,
		wallRender;
	
	var ring = new J3D.Transform();
	ring.meta=this;

	this.generate = function(){
		for(var i=0;i<segments;i++) {
			if(glasses){
				ring.add(Segment(i,1));
				ring.add(Segment(i,2))
			}
			else ring.add(Segment(i))
		}
		return ring
	};
	
	this.setColor = function(r,g,b,a) {
		var segment=ring.childAt(0);
		var col = new J3D.Color(r,g,b,a);
		roadRender.color = col;
		wallRender.color = col
	};
	
	this.setLQ = function() {
		for(var x in walls) {
			if(lowquality==0)walls[x].enabled=true;
			if(lowquality>=1&&walls[x].type=='outer') walls[x].enabled=false;
			if(lowquality==2&&walls[x].type=='wall') walls[x].enabled=false
		}
	};
	
	this.__defineGetter__('walls',function(){return walls});
		
	function Segment(i,channel){
		var perc=i/segments;
		var gperc=perc*2-1; 
		var x=Math.sin(gperc*Math.PI);
		var y=Math.cos(gperc*Math.PI);
		var iswall=y>-0.8;
		var isouter=iswall&&Math.round(r())==0;
		var isside=!iswall&&perc!=0;
		var isroad=!iswall&&!isside;
		var type=isroad?'road':isside?'roadside':isouter?'outer':'wall';
		var w=sps;
		var d=1;
		var trans=true;
		var col=new J3D.Color(1,1,1,1);
		var plane=new J3D.Transform();

		plane.renderer = shaders[type];
		if(!roadRender&&isroad)roadRender=plane.renderer;
		if(!wallRender&&iswall)wallRender=plane.renderer;

		switch(type){
			case 'road':
				if(glasses)plane.enabled=false;
				plane.renderer.colorTexture = textures.wall;
				w=3;
				y-=.4;
			break;
			case 'roadside':
				plane.renderer.colorTexture = textures.light;
				rot=1;
				x*=1.5;
				y-=0.6;
				w=0.1;
			break;
			case 'wall':
				perc+=Math.sin(r()*Math.PI*2)/10;
				gperc=perc*2-1; 
				x=Math.sin(gperc*Math.PI)*(2+r()*1.5);
				y=Math.cos(gperc*Math.PI)*(1+r()*1.5);
				d+=r()*2;
				w*=0.01+r()*0.05;
				walls.push(plane);
			break;
			case 'outer':
				perc+=Math.sin(r()*Math.PI*2)/10;
				gperc=perc*2-1; 
				x=Math.sin(gperc*Math.PI);
				y=Math.cos(gperc*Math.PI)-0.6;
				x*=6;
				y*=2+r()*4;
				d+=r()*5;
				walls.push(plane);
				plane.position.z-=5;
			break
		}

		var rot=1-2*perc;
		if(perc>0.5) rot-=2;

		plane.position.x = x*size;
		plane.position.y = y*size;
		plane.rotation.y = rot*Math.PI;
		plane.rotation.x = 0.5*Math.PI;
		plane.renderer.color = col;
		plane.renderer.hasColorTexture = true;
		plane.geometry = J3D.Primitive.Plane(w,d,0);
		plane.geometry.setTransparency(trans, gl.SRC_ALPHA, gl.DST_ALPHA);
		plane.type = type;

		return plane
	}
	
};

function initGameHooks() {
	var par = window.parent;
	par.GLIncreaseSpeed=par.GLDecreaseSpeed=par.GLDamage=par.GLEnemyDestroyed=par.GLLowHealth=par.GLResetSpeed=par.GLGameStart=par.GLGameStop=function(){}
};

function setGameHooks() {
	var par = window.parent;
	
	par.document.onmousemove = function(e){
		if(started)return;
		mx = ( e.clientX / window.innerWidth  ) * 2 - 1;
		my = ( e.clientY / window.innerHeight ) * 2 - 1;
		camera.rotation.y=-mx*0.2;
		camera.rotation.x=camrot-my*0.2
	};
	par.GLIncreaseSpeed=function(){
		speed=Math.min(speed+2,35);
		starspeed=Math.max(0,starspeed-2)
	};
	par.GLDecreaseSpeed=function(){
		speed=Math.max(0,speed-1);
		starspeed+=2
	};
	par.GLDamage=function(x,y){
		fx2=100
	};
	par.GLEnemyDestroyed=function(x,y,isEnemy){
		if(isEnemy)fx1=100;
		else fx2=100
	};
	par.GLLowHealth=function(){
		lowhealth=true
	};
	par.GLResetSpeed=function(){
		speed=12
	};
	par.GLGameStart=function(){
		started=true;
		camera.rotation.y=0;
		camera.rotation.x=camrot;
		lowhealth=false;
		tunnel.shown(showtunnel=true)
	};
	par.GLGameStop=function(){
		started=false;
		lowhealth=false;
		fx1=200;
		tunnel.shown(showtunnel=false)
	}
};
