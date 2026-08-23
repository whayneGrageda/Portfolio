import * as THREE from 'three';

/**
 * Service: 3D Rendering
 * Manages Three.js scene, camera, and animations
 */
export class ThreeDService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private group: THREE.Group | null = null;
  private animationId: number | null = null;
  private container: HTMLElement | null = null;

  /**
   * Initialize 3D scene in container
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Lighting
    this.setupLighting();

    // Create 3D object
    this.createGeometry();

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Start animation
    this.animate();
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.renderer && this.container) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }

    window.removeEventListener('resize', this.handleResize.bind(this));

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.group = null;
  }

  private setupLighting(): void {
    if (!this.scene) return;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Main light (Gold accent)
    const mainLight = new THREE.DirectionalLight(0xd2c4ae, 1.5);
    mainLight.position.set(2, 5, 5);
    this.scene.add(mainLight);

    // Rim light
    const rimLight = new THREE.PointLight(0xe3d2b5, 1);
    rimLight.position.set(-5, -2, -2);
    this.scene.add(rimLight);
  }

  private createGeometry(): void {
    if (!this.scene) return;

    this.group = new THREE.Group();

    // Core: Icosahedron with custom material
    const coreGeom = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0xd2c4ae,
      specular: 0xffffff,
      shininess: 100,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
      wireframe: false
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    this.group.add(core);

    // Outer Shell: Rotating Cage
    const shellGeom = new THREE.IcosahedronGeometry(1.8, 0);
    const shellMat = new THREE.MeshPhongMaterial({
      color: 0xe3d2b5,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    this.group.add(shell);

    // Detail: Small floating shards
    for (let i = 0; i < 8; i++) {
      const shardGeom = new THREE.TetrahedronGeometry(
        0.1 + Math.random() * 0.2,
        0
      );
      const shardMat = new THREE.MeshPhongMaterial({ color: 0xd2c4ae });
      const shard = new THREE.Mesh(shardGeom, shardMat);
      
      const angle = (i / 8) * Math.PI * 2;
      shard.position.set(
        Math.cos(angle) * 2,
        Math.sin(angle) * 2,
        (Math.random() - 0.5) * 1.5
      );
      
      (shard as any).userData = {
        speed: 0.01 + Math.random() * 0.02,
        index: i
      };
      
      this.group.add(shard);
    }

    this.scene.add(this.group);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.group) {
      // Slow, elegant rotation
      this.group.rotation.y += 0.003;
      this.group.rotation.z += 0.001;

      // Animate shards
      this.group.children.forEach((child, index) => {
        if (index > 1) { // Skip core and shell
          const shard = child as THREE.Mesh;
          const userData = (shard as any).userData;
          shard.rotation.x += userData.speed;
          shard.rotation.y += userData.speed;
          shard.position.y +=
            Math.sin(Date.now() * 0.001 + userData.index) * 0.002;
        }
      });
    }

    if (this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private handleResize(): void {
    if (!this.container || !this.camera || !this.renderer) return;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
