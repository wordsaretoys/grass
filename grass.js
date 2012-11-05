/**
	generate and draw the current chamber
	
	@namespace BED
	@class grass
**/

BED.grass = {

	rng: SOAR.random.create(BED.seed()),
	
	ground: {},
	grass: {},
	
	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var that = this;
		var rng = this.rng;
		var p = SOAR.vector.create();
		var mesh, tex;
		
		// generate textures
		tex = SOAR.space.makeU8(64, 64);
		SOAR.pattern.walk(tex, BED.seed(), 12, 0.05, 255, 0.5, 0.5, 0.5, 0.5);
		SOAR.pattern.normalize(tex, 0, 255);
		this.ground.dirt = SOAR.texture.create(BED.display, tex);
		
		tex = SOAR.space.makeU8(64, 64);
		SOAR.pattern.walk(tex, BED.seed(), 12, 0.05, 255, 0.5, 0.5, 0.5, 0.5);
		SOAR.pattern.normalize(tex, 0, 255);
		this.grass.stem = SOAR.texture.create(BED.display, tex);

		// load shaders
		this.ground.shader = SOAR.shader.create(
			BED.display,
			SOAR.textOf("vs-detail"), 
			SOAR.textOf("fs-ground"),
			["position", "texturec"], 
			["projector", "modelview"],
			["dirt"]
		); 

		this.grass.shader = SOAR.shader.create(
			BED.display,
			SOAR.textOf("vs-detail"), 
			SOAR.textOf("fs-grass"),
			["position", "texturec"], 
			["projector", "modelview"],
			["stem"]
		); 
		
		// make the ground
		var mesh = this.ground.mesh = SOAR.mesh.create(BED.display, BED.display.gl.TRIANGLE);
		mesh.add(this.ground.shader.position, 3);
		mesh.add(this.ground.shader.texturec, 2);

		mesh.set(-2, 0, -2, 0, 0);
		mesh.set(-2, 0, 2, 0, 1);
		mesh.set(2, 0, 2, 1, 1);
		mesh.set(2, 0, -2, 1, 0);
		
		mesh.index(0, 1, 3, 1, 2, 3);
		mesh.build();
		
		
		// make the grass
		var mesh = this.grass.mesh = SOAR.mesh.create(BED.display, BED.display.gl.TRIANGLE);
		mesh.add(this.grass.shader.position, 3);
		mesh.add(this.grass.shader.texturec, 2);

		(function() {
			var ang, x0, z0, x1, z1;
			var i, j, d;
			for (ang = 0, i = 0, j = 0; i < 100; i++, j += 4) {
				// pick a starting point for the billboard
				// based on whatever the current angle is
				x0 = Math.cos(ang);
				z0 = Math.sin(ang);
				// pick a new angle that's between pi/2 and 3pi/2 radians
				ang += rng.get(Math.PI * 0.5, Math.PI * 1.5);
				// pick the ending point for the billboard
				x1 = Math.cos(ang);
				z1 = Math.sin(ang);
				// determine the distance between the two points
				// we use this in texture coordinates to prevent
				// longer billboards from stretching the texture
				d = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(z0 - z1, 2));

				// set the four points of the quad, bending slightly at the top
				// to create a "bent stalks" effect, and dropping below the dirt
				// so no connecting lines are visible.
				mesh.set(x0, -0.1, z0, 0, 0);
				mesh.set(x0 + rng.get(-0.1, 0.1), 0.25, z0 + rng.get(-0.1, 0.1), 0, 1);

				mesh.set(x1 + rng.get(-0.1, 0.1), 0.25, z1 + rng.get(-0.1, 0.1), d, 1);
				mesh.set(x1, -0.1, z1, d, 0);
				
				// generate the indicies
				mesh.index(j, j + 1, j + 3, j + 1, j + 2, j + 3);
			}
		})();	
		mesh.build();
	},
	
	/**
		draw the peak
		
		@method draw
	**/
	 
	draw: function() {
		var gl = BED.display.gl;
		var camera = BED.player.camera;
		var shader;

		gl.disable(gl.BLEND);
		gl.disable(gl.CULL_FACE);

		shader = this.ground.shader;
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
		gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
		this.ground.dirt.bind(0, shader.dirt);
		this.ground.mesh.draw();
		
		shader = this.grass.shader;
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
		gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
		this.grass.stem.bind(0, shader.stem);
		this.grass.mesh.draw();
	}

};