// 3D Brain Visualizer using Three.js
class Brain3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.brainMeshes = {};
        this.brainRegionData = {};
        this.activeRegions = new Set();
        this.lights = {};

        // Animation
        this.clock = new THREE.Clock();
        this.animationId = null;

        // Camera controls
        this.controls = null;
        this.autoRotate = true;
        this.rotationSpeed = 0.0005;
    }

    initialize() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createBrain();
        this.setupControls();
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Add subtle fog for depth
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    }

    setupCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(15, 5, 12);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x4488bb, 0.3);
        this.scene.add(ambientLight);

        // Main key light (from front-left)
        const keyLight = new THREE.DirectionalLight(0x88ccff, 1.2);
        keyLight.position.set(-8, 5, 8);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        this.scene.add(keyLight);
        this.lights.key = keyLight;

        // Fill light (from right)
        const fillLight = new THREE.DirectionalLight(0x6699cc, 0.4);
        fillLight.position.set(8, 3, 5);
        this.scene.add(fillLight);
        this.lights.fill = fillLight;

        // Rim light (from behind)
        const rimLight = new THREE.DirectionalLight(0x99ddff, 0.6);
        rimLight.position.set(0, 3, -8);
        this.scene.add(rimLight);
        this.lights.rim = rimLight;

        // Point light for internal glow effect
        const internalLight = new THREE.PointLight(0x00aaff, 0.5, 15);
        internalLight.position.set(0, 0, 0);
        this.scene.add(internalLight);
        this.lights.internal = internalLight;
    }

    setupControls() {
        // Simple orbit controls using mouse
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.autoRotate = false;
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.offsetX - previousMousePosition.x;
                const deltaY = e.offsetY - previousMousePosition.y;

                this.camera.position.x += deltaX * 0.01;
                this.camera.position.y -= deltaY * 0.01;
                this.camera.lookAt(0, 0, 0);
            }

            previousMousePosition = {
                x: e.offsetX,
                y: e.offsetY
            };
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Zoom with mouse wheel
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(delta);
        });
    }

    createBrain() {
        // Create skull outline (wireframe)
        this.createSkull();

        // Create brain regions with anatomical accuracy
        this.createBrainRegion('prefrontal-cortex', {
            position: [-2, 1.5, 2],
            size: [1.5, 1.8, 2],
            color: 0x8ca0b4,
            name: 'Prefrontal Cortex',
            description: 'Musical anticipation & emotional regulation'
        });

        this.createBrainRegion('motor-cortex', {
            position: [0, 2.5, 0],
            size: [2, 1.5, 2],
            color: 0x8ca0b4,
            name: 'Motor Cortex',
            description: 'Rhythm processing & beat tracking'
        });

        this.createBrainRegion('parietal-lobe', {
            position: [1.5, 1.8, -0.5],
            size: [1.8, 1.6, 2],
            color: 0x8ca0b4,
            name: 'Parietal Lobe',
            description: 'Spatial awareness & sensory integration'
        });

        this.createBrainRegion('visual-cortex', {
            position: [2, 0.5, -2],
            size: [1.5, 1.5, 1.5],
            color: 0x8ca0b4,
            name: 'Visual Cortex',
            description: 'Pattern recognition & musical imagery'
        });

        this.createBrainRegion('temporal-lobe', {
            position: [-1.5, -0.5, 1],
            size: [1.8, 2, 2.2],
            color: 0x8ca0b4,
            name: 'Temporal Lobe',
            description: 'Musical memory & recognition'
        });

        this.createBrainRegion('auditory-cortex', {
            position: [-1, -0.3, 0.8],
            size: [1.2, 1.2, 1.2],
            color: 0x8ca0b4,
            name: 'Auditory Cortex',
            description: 'Sound processing & pitch analysis'
        });

        this.createBrainRegion('limbic-system', {
            position: [0, -0.2, 0],
            size: [1.5, 1.8, 1.5],
            color: 0x8ca0b4,
            name: 'Limbic System',
            description: 'Emotional response & pleasure'
        });

        this.createBrainRegion('cerebellum', {
            position: [1, -2, -1.5],
            size: [2, 1.8, 2],
            color: 0x8ca0b4,
            name: 'Cerebellum',
            description: 'Timing precision & beat tracking'
        });

        this.createBrainRegion('brainstem', {
            position: [0, -3, 0],
            size: [0.8, 2, 0.8],
            color: 0x8ca0b4,
            name: 'Brain Stem',
            description: 'Arousal & attention'
        });

        this.createBrainRegion('hippocampus', {
            position: [0, -1, 0.5],
            size: [1, 1.5, 1],
            color: 0x8ca0b4,
            name: 'Hippocampus',
            description: 'Memory formation & associations'
        });

        // Add gyri and sulci details (brain folds)
        this.addBrainFolds();
    }

    createSkull() {
        // Create skull wireframe outline
        const skullGeometry = new THREE.SphereGeometry(5, 32, 32, 0, Math.PI);
        const skullMaterial = new THREE.MeshBasicMaterial({
            color: 0x3a5a6a,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });

        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.rotation.y = -Math.PI / 4;
        this.scene.add(skull);
    }

    createBrainRegion(id, config) {
        // Create organic brain tissue shape
        const geometry = new THREE.IcosahedronGeometry(1, 2);

        // Deform geometry to make it more organic
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            // Add organic deformation
            const noise = Math.sin(x * 3) * Math.cos(y * 3) * Math.sin(z * 3) * 0.15;
            positions.setXYZ(
                i,
                x * (1 + noise) * config.size[0],
                y * (1 + noise) * config.size[1],
                z * (1 + noise) * config.size[2]
            );
        }

        geometry.computeVertexNormals();

        // Create material with realistic brain tissue appearance
        const material = new THREE.MeshPhysicalMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.25,
            metalness: 0.1,
            roughness: 0.8,
            transmission: 0.3,
            thickness: 0.5,
            side: THREE.DoubleSide,
            envMapIntensity: 0.5,
            clearcoat: 0.3,
            clearcoatRoughness: 0.7
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(config.position[0], config.position[1], config.position[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Store mesh and data
        this.brainMeshes[id] = mesh;
        this.brainRegionData[id] = config;

        this.scene.add(mesh);

        // Add subtle outline effect
        const outlineGeometry = geometry.clone();
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x6488a0,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });

        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.scale.multiplyScalar(1.05);
        mesh.add(outline);
    }

    addBrainFolds() {
        // Add curved lines representing gyri and sulci
        const foldMaterial = new THREE.LineBasicMaterial({
            color: 0x406080,
            transparent: true,
            opacity: 0.4
        });

        // Create multiple curved paths across brain surface
        for (let i = 0; i < 20; i++) {
            const points = [];
            const segments = 15;

            for (let j = 0; j < segments; j++) {
                const t = j / (segments - 1);
                const angle = t * Math.PI * 2 + i * 0.3;
                const radius = 3 + Math.sin(t * Math.PI * 3) * 0.5;

                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(t * Math.PI * 4) * 2 - 1,
                    Math.sin(angle) * radius
                ));
            }

            const foldGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const fold = new THREE.Line(foldGeometry, foldMaterial);
            this.scene.add(fold);
        }
    }

    update(analysis) {
        if (!analysis) return;

        // Determine which regions should be active based on audio analysis
        const newActiveRegions = new Set();

        // Map audio features to brain regions (same logic as SVG version)
        const regionTriggers = {
            'prefrontal-cortex': () => analysis.tempo > 40 || analysis.spectralCentroid > 30,
            'motor-cortex': () => analysis.tempo > 50 || analysis.bassEnergy > 50,
            'parietal-lobe': () => analysis.brightness > 45 || analysis.spectralCentroid > 30,
            'auditory-cortex': () => analysis.midEnergy > 30 || analysis.frequency > 30 || analysis.highEnergy > 30,
            'temporal-lobe': () => analysis.midEnergy > 35,
            'limbic-system': () => analysis.energy > 55 || analysis.bassEnergy > 55,
            'cerebellum': () => analysis.tempo > 45 || analysis.bassEnergy > 45,
            'visual-cortex': () => analysis.brightness > 40 || analysis.spectralCentroid > 30,
            'brainstem': () => analysis.energy > 60,
            'hippocampus': () => analysis.midEnergy > 38 || analysis.spectralCentroid > 30
        };

        // Check each region
        Object.keys(this.brainMeshes).forEach(regionId => {
            if (regionTriggers[regionId] && regionTriggers[regionId]()) {
                newActiveRegions.add(regionId);

                // Determine intensity
                let intensity = 'low';
                if (analysis.energy > 70) {
                    intensity = 'high';
                } else if (analysis.energy > 50) {
                    intensity = 'medium';
                }

                this.activateRegion(regionId, intensity);
            } else {
                this.deactivateRegion(regionId);
            }
        });

        this.activeRegions = newActiveRegions;
    }

    activateRegion(regionId, intensity = 'low') {
        const mesh = this.brainMeshes[regionId];
        if (!mesh) return;

        const material = mesh.material;

        // Set glow based on intensity
        switch (intensity) {
            case 'high':
                material.color.setHex(0xff8c00); // Orange
                material.opacity = 0.65;
                material.emissive = new THREE.Color(0xff8c00);
                material.emissiveIntensity = 2.5;
                break;
            case 'medium':
                material.color.setHex(0x00e6ff); // Bright cyan
                material.opacity = 0.45;
                material.emissive = new THREE.Color(0x00e6ff);
                material.emissiveIntensity = 1.5;
                break;
            case 'low':
            default:
                material.color.setHex(0x00c8ff); // Cyan
                material.opacity = 0.35;
                material.emissive = new THREE.Color(0x00c8ff);
                material.emissiveIntensity = 1.0;
                break;
        }

        // Add pulsing animation
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * 2) * 0.1 + 0.9;
        mesh.scale.setScalar(1 + pulse * 0.05);
    }

    deactivateRegion(regionId) {
        const mesh = this.brainMeshes[regionId];
        if (!mesh) return;

        const material = mesh.material;

        // Return to base state
        material.color.setHex(0x8ca0b4);
        material.opacity = 0.25;
        material.emissive = new THREE.Color(0x000000);
        material.emissiveIntensity = 0;
        mesh.scale.setScalar(1);
    }

    reset() {
        Object.keys(this.brainMeshes).forEach(regionId => {
            this.deactivateRegion(regionId);
        });
        this.activeRegions.clear();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Auto-rotate camera if enabled
        if (this.autoRotate) {
            const time = Date.now() * this.rotationSpeed;
            const radius = 15;
            this.camera.position.x = Math.cos(time) * radius;
            this.camera.position.z = Math.sin(time) * radius;
            this.camera.lookAt(0, 0, 0);
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Clean up Three.js resources
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        this.renderer.dispose();
    }
}
