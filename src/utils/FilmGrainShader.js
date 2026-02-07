export default class FilmGrainShader {
	constructor() {
		return this.#createShader();
	}

	#createShader() {
		return {
			uniforms: {
				tDiffuse: { value: null },
				time: { value: 0.0 },
				intensity: { value: 0.15 },
			},
			vertexShader: this.#getVertexShader(),
			fragmentShader: this.#getFragmentShader(),
		};
	}

	#getVertexShader() {
		return /* glsl */ `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
	}

	#getFragmentShader() {
		return /* glsl */ `
            uniform sampler2D tDiffuse;
            uniform float time;
            uniform float intensity;
            varying vec2 vUv;

            float random(vec2 co) {
                return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vec4 color = texture2D(tDiffuse, vUv);
                float noise = random(vUv + fract(time)) * 2.0 - 1.0;
                color.rgb += noise * intensity;
                gl_FragColor = color;
            }
	    `;
	}
}
