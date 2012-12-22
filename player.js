/**
	maintain player state and camera, handle control 
	events related to player motion and interactions
	
	@namespace BED
	@class player
**/

BED.player = {

	motion: {
		moveleft: false, moveright: false,
		movefore: false, moveback: false,
		movefast: false
	},
	
	scratch: {
		d: SOAR.vector.create(),
		q: SOAR.quaternion.create()
	},

	normalMatrix: new Float32Array(16),
	
	debug: false,
	
	/**
		establish jQuery shells around player DOM objects &
		set up event handlers for player controls
		
		tracker div lies over canvas and HUD elements, which
		allows us to track mouse movements without issues in
		the mouse pointer sliding over an untracked element.
		
		@method init
	**/

	init: function() {
		var that = this;

		// create a constrained camera for player view
		this.camera = SOAR.camera.create(BED.display);
		this.camera.nearLimit = 0.01;
		this.camera.farLimit = 20000;
		this.camera.free = false;
		this.camera.bound.set(Math.sqrt(2) / 2, -1, 0);
		
		this.camera.position.set(0, 1, 2);
		this.camera.turn(Math.PI * 0.1, 0, 0);
		
		// set up events to capture
		SOAR.capture.addAction("forward", SOAR.KEY.W, function(down) {
			that.motion.movefore = down;
		});
		SOAR.capture.addAction("backward", SOAR.KEY.S, function(down) {
			that.motion.moveback = down;
		});
		SOAR.capture.addAction("left", SOAR.KEY.A, function(down) {
			that.motion.moveleft = down;
		});
		SOAR.capture.addAction("right", SOAR.KEY.D, function(down) {
			that.motion.moveright = down;
		});
		SOAR.capture.addAction("sprint", SOAR.KEY.SHIFT, function(down) {
			that.motion.movefast = down;
		});
		SOAR.capture.addAction("pause", SOAR.KEY.PAUSE, function(down) {
			if (down) {
				if (SOAR.running) {
					BED.debugit.innerHTML = "*** PAUSED ***";
					SOAR.running = false;
				} else {
					BED.debugit.innerHTML = "";
					SOAR.running = true;
				}
			}
		});
		SOAR.capture.addAction("fullscreen", SOAR.KEY.Q, function(down) {
			if (down) {
				SOAR.capture.setFullscreen();
			}
		});
		
		SOAR.capture.addAction("debug", SOAR.KEY.Z, function(down) {
			if (down) {
				that.debug = !that.debug;
			}
		});
	},
	
	/**
		react to player controls by updating velocity and position
		
		called on every animation frame
		
		@method update
	**/

	update: function() {
		var motion = this.motion;
		var camera = this.camera;
		var mouse = this.mouse;
		var direct = this.scratch.d;
		var dx, dy, speed;

		// get mouse deltas, transform by time deltas, and normalize by screen
		dx = 250 * SOAR.sinterval * SOAR.capture.trackX / BED.display.width;
		dy = 250 * SOAR.sinterval * SOAR.capture.trackY / BED.display.height;
	
		// turn the camera by specified rotations
		camera.turn(dy, dx, 0);

		// force no-roll on camera because I'm paranoid
		camera.component.z.set(0, 0, 0, 1);
		
		// determine new movement direction
		direct.set();
		if (motion.movefore) {
			direct.add(camera.front);
		}
		if (motion.moveback) {
			direct.sub(camera.front);
		}
		if (motion.moveleft) {
			direct.sub(camera.right);
		}
		if (motion.moveright) {
			direct.add(camera.right);
		}
		speed = (motion.movefast ? 2 : 1) * SOAR.sinterval;
		direct.norm().mul(speed);
		camera.position.add(direct);
		
		// generate camera matrixes
		// (will be cached in the camera object)
		camera.modelview();
		camera.projector();
		
	}
};
