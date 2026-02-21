// car3d.js - 3D Car Model with GLTFLoader
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function initCar3D() {
    const container = document.getElementById('car-container');
    if (!container) return;
    
    // Wait for container to have dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;
    
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(5, 2.5, 8);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // OrbitControls for manual rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 3;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 2;

    // Improved lighting for light background
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Key light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 1);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // Rim light (back)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // Warm accent light
    const warmLight = new THREE.PointLight(0xffd280, 0.6, 30);
    warmLight.position.set(-3, 2, 5);
    scene.add(warmLight);

    let carModel = null;
    let baseScale = 1;

    // Calculate responsive scale based on container width
    function getResponsiveScale() {
        const w = container.clientWidth;
        if (w < 400) return 4;
        if (w < 600) return 5;
        if (w < 800) return 5.5;
        return 6.5;
    }

    // Load GLB model
    const loader = new GLTFLoader();

    loader.load(
        'model.glb',
        (gltf) => {
            carModel = gltf.scene;
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(carModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            baseScale = 1 / maxDim;
            
            const targetScale = getResponsiveScale() * baseScale;
            carModel.scale.set(targetScale, targetScale, targetScale);
            
            // Center the model
            carModel.position.sub(center.multiplyScalar(targetScale));
            carModel.position.y -= 0.2;
            
            scene.add(carModel);
            console.log('3D car model loaded successfully');
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`Loading model: ${percent}%`);
        },
        (error) => {
            console.error('Error loading 3D model:', error);
            // Fallback: create a simple placeholder car
            createPlaceholderCar();
        }
    );

    // Fallback placeholder car if model doesn't load
    function createPlaceholderCar() {
        const carGroup = new THREE.Group();
        
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3
        });
        
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xc9a227,
            metalness: 0.8,
            roughness: 0.2
        });
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(4, 0.8, 1.8);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        carGroup.add(body);
        
        // Hood
        const hoodGeometry = new THREE.BoxGeometry(1.2, 0.3, 1.6);
        const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
        hood.position.set(1.8, 0.85, 0);
        carGroup.add(hood);
        
        // Cabin
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const cabinGeometry = new THREE.BoxGeometry(1.8, 0.7, 1.5);
        const cabin = new THREE.Mesh(cabinGeometry, glassMaterial);
        cabin.position.set(-0.1, 1.35, 0);
        carGroup.add(cabin);
        
        // Wheels
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.3,
            roughness: 0.8
        });
        const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
        const wheelPositions = [
            { x: 1.2, y: 0.35, z: 0.9 },
            { x: 1.2, y: 0.35, z: -0.9 },
            { x: -1.2, y: 0.35, z: 0.9 },
            { x: -1.2, y: 0.35, z: -0.9 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(pos.x, pos.y, pos.z);
            carGroup.add(wheel);
            
            const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.26, 12);
            const rim = new THREE.Mesh(rimGeometry, goldMaterial);
            rim.rotation.x = Math.PI / 2;
            rim.position.set(pos.x, pos.y, pos.z);
            carGroup.add(rim);
        });
        
        // Gold stripes
        const stripeGeometry = new THREE.BoxGeometry(4.2, 0.05, 0.1);
        const leftStripe = new THREE.Mesh(stripeGeometry, goldMaterial);
        leftStripe.position.set(0, 0.5, 0.95);
        carGroup.add(leftStripe);
        
        const rightStripe = new THREE.Mesh(stripeGeometry, goldMaterial);
        rightStripe.position.set(0, 0.5, -0.95);
        carGroup.add(rightStripe);
        
        carModel = carGroup;
        scene.add(carGroup);
    }

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        
        // Update model scale on resize
        if (carModel && baseScale) {
            const targetScale = getResponsiveScale() * baseScale;
            carModel.scale.set(targetScale, targetScale, targetScale);
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCar3D);
} else {
    initCar3D();
}