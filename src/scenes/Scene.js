import * as THREE from "three";
import WebGLContext from "../core/WebGLContext";
import ImportGltf from "../utils/ImportGltf";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export default class Scene {
	constructor() {
		this.context = null;
		this.camera = null;
		this.cameraRig = null;
		this.width = 0;
		this.height = 0;
		this.aspectRatio = 0;
		this.scene = null;
		this.envMap = null;
		this.material = null;
		this.mixer = null;
		this.#init();
	}

	async #init() {
		this.#setContext();
		this.#setupScene();
		this.#setupCamera();
		this.#addLights();
		await this.#addObjects();
	}

	#setContext() {
		this.context = new WebGLContext();
	}

	#setupScene() {
		this.scene = new THREE.Scene();
		const environment = new RoomEnvironment();
		const pmremGenerator = new THREE.PMREMGenerator(this.context.renderer);
		this.envMap = pmremGenerator.fromScene(environment).texture;
		this.scene.environment = this.envMap;
		this.scene.environmentIntensity = 0.4;
		this.scene.background = new THREE.Color(0x000000);
	}

	#setupCamera() {
		this.#calculateAspectRatio();
		this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio, 0.001, 100);
		this.camera.position.z = 9;
		this.camera.position.y = -7.0;
		this.camera.position.x = 7.0;
		this.camera.lookAt(0, 0, 0);
	}

	#addLights() {}

	async #addObjects() {
		this.material = new THREE.MeshStandardMaterial({
			metalness: 1.0,
			roughness: 0.25,
			color: 0xc0c0c0,
			flatShading: false,
		});

		new ImportGltf(`${import.meta.env.BASE_URL}text.glb`, {
			onLoad: (model, gltf) => {
				this.mesh = model;
				this.gltf = gltf;
				this.mesh.traverse((children) => {
					if (!children.isMesh) return;
					children.material = this.material;
				});

				this.scene.add(model);

				this.mixer = new THREE.AnimationMixer(model);
				this.mixer.timeScale = 0.65;
				this.#setUpEventListener();
			},
		});
	}

	#setUpEventListener() {
		const loopDelay = 50;

		this.gltf.animations.forEach((clip) => {
			const action = this.mixer.clipAction(clip);
			action.loop = THREE.LoopPingPong;
			action.play();
		});

		this.mixer.addEventListener("loop", (e) => {
			e.action.paused = true;
			setTimeout(() => {
				e.action.paused = false;
			}, loopDelay);
		});
	}

	#calculateAspectRatio() {
		const { width, height } = this.context.getFullScreenDimensions();
		this.width = width;
		this.height = height;
		this.aspectRatio = this.width / this.height;
	}

	animate(delta, elapsed) {
		this.mixer && this.mixer.update(delta);
	}

	onResize(width, height) {
		this.width = width;
		this.height = height;
		this.aspectRatio = width / height;

		this.camera.aspect = this.aspectRatio;
		this.camera.updateProjectionMatrix();
	}
}
