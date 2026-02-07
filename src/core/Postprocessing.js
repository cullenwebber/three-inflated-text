import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { N8AOPass } from "n8ao";
import WebGLContext from "./WebGLContext";
import FilmGrainShader from "../utils/FilmGrainShader";

export default class Postprocessing {
	constructor(scene, camera) {
		this.context = new WebGLContext();
		this.composer = new EffectComposer(this.context.renderer);

		this.n8ao = new N8AOPass(scene, camera);
		this.n8ao.configuration.aoRadius = 1.0;
		this.n8ao.configuration.distanceFalloff = 3.0;
		this.n8ao.configuration.intensity = 6.0;

		this.composer.addPass(this.n8ao);

		this.noise = new ShaderPass(new FilmGrainShader());
		this.composer.addPass(this.noise);

		this.clock = new THREE.Clock();
	}

	render() {
		this.noise.uniforms.time.value = this.clock.getElapsedTime();
		this.composer.render();
	}

	onResize(width, height) {
		this.composer.setSize(width, height);
	}
}
