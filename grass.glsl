<script id="vs-detail" type="x-shader/x-vertex">

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;

varying vec3 obj;
varying vec3 eye;
varying vec2 tex;

void main(void) {
	vec4 pos = modelview * vec4(position, 1.0);
	gl_Position = projector * pos;
	eye = pos.xyz;
	obj = position;
	tex = texturec;
}

</script>

<script id="fs-ground" type="x-shader/x-fragment">

precision mediump float;

uniform sampler2D dirt;

varying vec3 obj;
varying vec3 eye;
varying vec2 tex;

void main(void) {
	float c = texture2D(dirt, tex * 2.0).r * texture2D(dirt, tex * 16.0).r;
	vec3 col = c * vec3(0.8, 0.4, 0.2);
	gl_FragColor = vec4(col, 1.0);
}

</script>

<script id="fs-grass" type="x-shader/x-fragment">

precision mediump float;

const float PI = 3.141592654;

uniform sampler2D stem;

varying vec3 obj;
varying vec3 eye;
varying vec2 tex;

void main(void) {

	// this bit simply generates color and shading for the grass stems,
	// and has nothing at all to do with discarding pixels
	float l = texture2D(stem, tex * 0.01).r * texture2D(stem, tex * 0.1).r * 2.0;
	float c = texture2D(stem, tex * 0.02).r * texture2D(stem, tex * 0.2).r * 3.0;
	vec3 col = l * mix(vec3(0.0, 0.0, 0.0), vec3(0.57, 0.71, 0.14), c);
	gl_FragColor = vec4(col, 1.0);
	
	// generate a skinny sinewave along the x-axis
	float t = pow(0.5 + 0.5 * sin(32.0 * tex.x), 8.0);
	// if the sinewave value is less than the y-axis
	// toss the fragment away
	if (t < tex.y)
		discard;
}

</script>
