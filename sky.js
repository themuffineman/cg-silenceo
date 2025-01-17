// Create a self-contained sky background component
function createSkyBackground() {
  // Create container with same styling as React version
  const skyContainer = document.createElement("div");
  skyContainer.style.position = "fixed";
  //   skyContainer.style.inset = "0";
  skyContainer.style.width = "100vw";
  skyContainer.style.height = "100vh";
  skyContainer.style.zIndex = "-1";
  skyContainer.id = "sky-background";

  // Scene setup
  const scene = new THREE.Scene();

  // Match the camera settings from the React version
  const camera = new THREE.PerspectiveCamera(
    90, // fov
    window.innerWidth / window.innerHeight,
    0.1, // near
    1000 // far
  );
  camera.position.set(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  skyContainer.appendChild(renderer.domElement);

  // Match the lighting setup from the React version
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 5, 10);
  scene.add(pointLight);

  const spotLight = new THREE.SpotLight(0xffffff, 2);
  spotLight.position.set(0, 50, 10);
  spotLight.angle = 0.15;
  spotLight.penumbra = 1;
  scene.add(spotLight);

  const hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0x000000, 1);
  scene.add(hemisphereLight);

  // State variables
  let skyModel;
  let currentRotation = { x: 0, y: 0 };
  let targetRotation = { x: 0, y: 0 };
  let isRotating = false; // You can control this from outside if needed

  // Load sky model
  const loader = new THREE.GLTFLoader();
  loader.load(
    "./assets/sky.glb", // Updated path to match React version
    function (gltf) {
      skyModel = gltf.scene;
      scene.add(skyModel);
    },
    undefined,
    function (error) {
      console.error("Error loading sky model:", error);
    }
  );

  // Mouse movement handler (matching React version)
  function handleMouseMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    targetRotation.x = y * 0.1;
    targetRotation.y = x * 0.1;
  }

  // Animation loop
  function animate(time) {
    requestAnimationFrame(animate);

    if (skyModel) {
      // Smoothly interpolate rotation (matching React version's lerp)
      currentRotation.x = THREE.MathUtils.lerp(
        currentRotation.x,
        targetRotation.x,
        0.2
      );
      currentRotation.y = THREE.MathUtils.lerp(
        currentRotation.y,
        targetRotation.y,
        0.2
      );

      skyModel.rotation.x = currentRotation.x;
      skyModel.rotation.y = currentRotation.y;

      // Optional rotation if isRotating is true
      if (isRotating) {
        console.log("rotating!!");

        skyModel.rotation.y += (0.1 * (time - lastTime)) / 1000;
      }
    }

    renderer.render(scene, camera);
    lastTime = time;
  }
  let lastTime = 0;

  // Handle window resize
  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Event listeners
  window.addEventListener("resize", onResize);
  window.addEventListener("mousemove", handleMouseMove);

  // Start animation
  animate(0);

  // Add to page
  document.body.prepend(skyContainer);

  // Return cleanup function (similar to React useEffect cleanup)
  return function cleanup() {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", handleMouseMove);
    skyContainer.remove();
  };
}

// Initialize when DOM is ready
let cleanup;
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    createSkyBackground();
  }, 500);
});

// Optional: Cleanup on page unload
window.addEventListener("unload", () => {
  if (cleanup) cleanup();
});

// Export function to control rotation if needed
window.toggleSkyRotation = function (rotating) {
  isRotating = rotating;
};
