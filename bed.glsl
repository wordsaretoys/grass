<script id="fs-simple" type="x-shader/x-fragment">

/**
	simple texture-driven fragment shader
**/

precision mediump float;

uniform sampler2D image;

varying vec2 tex;

void main(void) {
	gl_FragColor = texture2D(image, tex);
}

</script>

<script id="fs-contour" type="x-shader/x-fragment">

/**
        thing fragment shader
**/

precision mediump float;

const float PI = 3.141592654;

uniform sampler2D noise;

varying vec3 obj;
varying vec3 eye;
varying vec2 tex;

void main(void) {
	vec3 f0 = vec3(0.01, 0.02, -0.03);
	vec3 f1 = vec3(-0.1, 0.5, 0.9);
	
	float mix0 = fract( obj.y * 0.1 + 
		sin(f0.x * obj.x * PI + f1.x) +
		sin(f0.y * obj.y * PI + f1.y) +
		sin(f0.z * obj.z * PI + f1.z));
		
	mix0 = mix0 * 4.0;
	float mix1 = fract(mix0);
	mix0 = ceil(mix0) / 4.0;
	vec3 col = mix(vec3(0.8, 0.6, 0.1), vec3(0.0, 0.7, 1.0), mix0);

	mix1 = abs(sin(mix1 * PI));
	col = mix(vec3(0.0, 0.0, 0.0), col, pow(mix1, 0.2));

	float mix2 = 0.33 * texture2D(noise, tex).x +
		0.33 * texture2D(noise, tex * 5.0).x +
		0.34 * texture2D(noise, tex * 25.0).x;

	col = col * pow(mix2, 0.5);
	
	gl_FragColor = vec4(col, 1.0);
}

</script>


<script id="vs-line" type="x-shader/x-vertex">

attribute vec3 position;

uniform mat4 projector;
uniform mat4 modelview;

void main(void) {
	gl_Position = projector * modelview * vec4(position, 1.0);
}

</script>

<script id="fs-line" type="x-shader/x-fragment">

/**
        line fragment shader
**/

precision mediump float;

void main(void) {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}

</script>


