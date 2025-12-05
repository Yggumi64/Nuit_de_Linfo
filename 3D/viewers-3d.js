import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Score handling for this page ---
const _params3d = new URLSearchParams(window.location.search);
let pageScore = Number(_params3d.get('score')) || 0;
const PAGE_SCORE_MAX = pageScore + 8;

function setScore3D(newScore) {
    pageScore = Math.min(Number(newScore) || 0, PAGE_SCORE_MAX);
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = pageScore;
    if (window.updateScoreNav) window.updateScoreNav(pageScore);
    try {
        const u = new URL(window.location.href);
        u.searchParams.set('score', String(pageScore));
        window.history.replaceState({}, '', u.toString());
    } catch (e) {
        // ignore
    }
}

// initialize displayed score on page load
setScore3D(pageScore);

class Viewer3D {
    constructor(container, modelPath, errorId) {
        this.container = container;
        this.modelPath = modelPath;
        this.errorId = errorId;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.loader = new GLTFLoader();
        this.isAnimating = false;
        this.startTime = 0;
        this.duration = 1000;
        this.initialRotationY = 0;
        console.log(`🔄 Chargement de: ${modelPath}`);
        this.setup();
    }

    setup() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        this.scene.background = new THREE.Color(0x1a1a1a);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-5, 5, -5);
        this.scene.add(pointLight);

        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.enableRotate = false;
        this.controls.autoRotate = false;

        this.loadModel();

        this.container.addEventListener('click', () => this.startRotation());
        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
    }

    loadModel() {
        fetch(this.modelPath)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                console.log(`✅ ${this.modelPath} accessible`);
                return response.blob();
            })
            .then(() => {
                this.loader.load(
                    this.modelPath,
                    (gltf) => {
                        console.log(`✅ Modèle chargé: ${this.modelPath}`);
                        const model = gltf.scene;
                        model.rotation.y = 0;
                        model.scale.set(1, 1, 1);
                        model.position.set(0, 0, 0);
                        model.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        this.scene.add(model);
                        this.model = model;
                        this.initialRotationY = 0;
                    },
                    (progress) => {
                        console.log(`📥 ${this.modelPath}: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
                    },
                    (error) => {
                        console.error(`❌ Erreur GLTF ${this.modelPath}:`, error);
                        this.showError(`Erreur GLTF`);
                        this.createFallbackModel();
                    }
                );
            })
            .catch((error) => {
                console.error(`❌ Fichier inaccessible ${this.modelPath}:`, error);
                this.showError(`Fichier non trouvé`);
                this.createFallbackModel();
            });
    }

    showError(message) {
        const errorEl = document.getElementById(this.errorId);
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    createFallbackModel() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xff4444, metalness: 0.5, roughness: 0.3 });
        this.fallbackMesh = new THREE.Mesh(geometry, material);
        this.fallbackMesh.rotation.y = 0;
        this.fallbackMesh.castShadow = true;
        this.scene.add(this.fallbackMesh);
        this.initialRotationY = 0;
    }

    startRotation() {
        if (this.isAnimating) return;
        // increment page score by 1 on each (valid) click, capped at PAGE_SCORE_MAX
        if (pageScore < PAGE_SCORE_MAX) {
            setScore3D(pageScore + 1);
        }
        console.log('UwU');
        this.isAnimating = true;
        this.startTime = performance.now();
        
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const currentTime = performance.now();
        
        if (this.isAnimating) {
            const elapsed = currentTime - this.startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            const easedProgress = 0.5 * (1 - Math.cos(progress * Math.PI));
            
            if (this.model) {
                this.model.rotation.y = this.initialRotationY + Math.PI * easedProgress;
            } else if (this.fallbackMesh) {
                this.fallbackMesh.rotation.y = this.initialRotationY + Math.PI * easedProgress;
            }
            
            if (progress >= 1) {
                this.isAnimating = false;
                if (this.model) this.initialRotationY = this.model.rotation.y;
                else if (this.fallbackMesh) this.initialRotationY = this.fallbackMesh.rotation.y;
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Initialisation de tous les viewers
document.querySelectorAll('.viewer-container').forEach((container, index) => {
    const modelPath = container.dataset.model;
    const errorId = `error${index + 1}`;
    new Viewer3D(container, modelPath, errorId);
});
