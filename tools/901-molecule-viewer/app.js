// Molecule Viewer - Tool #901

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('molecule-canvas');
    const resetViewBtn = document.getElementById('reset-view');
    const toggleRotationBtn = document.getElementById('toggle-rotation');
    const moleculeNameEl = document.getElementById('molecule-name');
    const moleculeInfoEl = document.getElementById('molecule-info');
    const presetMoleculesEl = document.getElementById('preset-molecules');
    const atomLegendEl = document.getElementById('atom-legend');

    // Three.js setup
    let scene, camera, renderer, moleculeGroup;
    let isAutoRotating = false;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Atom properties
    const atomData = {
        H: { color: 0xffffff, radius: 0.31, mass: 1.008, name: 'Hydrogen' },
        C: { color: 0x333333, radius: 0.77, mass: 12.011, name: 'Carbon' },
        N: { color: 0x3050f8, radius: 0.71, mass: 14.007, name: 'Nitrogen' },
        O: { color: 0xff0d0d, radius: 0.66, mass: 15.999, name: 'Oxygen' },
        S: { color: 0xffff30, radius: 1.05, mass: 32.065, name: 'Sulfur' },
        P: { color: 0xff8000, radius: 1.07, mass: 30.974, name: 'Phosphorus' },
        Cl: { color: 0x1ff01f, radius: 0.99, mass: 35.453, name: 'Chlorine' },
        F: { color: 0x90e050, radius: 0.64, mass: 18.998, name: 'Fluorine' },
        Br: { color: 0xa62929, radius: 1.14, mass: 79.904, name: 'Bromine' },
        I: { color: 0x940094, radius: 1.33, mass: 126.90, name: 'Iodine' },
        Na: { color: 0xab5cf2, radius: 1.66, mass: 22.990, name: 'Sodium' },
        Fe: { color: 0xe06633, radius: 1.24, mass: 55.845, name: 'Iron' }
    };

    // Molecule definitions
    const molecules = {
        water: {
            name: 'Water',
            formula: 'H₂O',
            description: 'Water is essential for life. It consists of two hydrogen atoms bonded to one oxygen atom.',
            atoms: [
                { element: 'O', position: [0, 0, 0] },
                { element: 'H', position: [0.96, 0, 0] },
                { element: 'H', position: [-0.24, 0.93, 0] }
            ],
            bonds: [[0, 1], [0, 2]]
        },
        methane: {
            name: 'Methane',
            formula: 'CH₄',
            description: 'Methane is the simplest alkane and a potent greenhouse gas. It has a tetrahedral structure.',
            atoms: [
                { element: 'C', position: [0, 0, 0] },
                { element: 'H', position: [1.09, 0, 0] },
                { element: 'H', position: [-0.36, 1.03, 0] },
                { element: 'H', position: [-0.36, -0.51, 0.89] },
                { element: 'H', position: [-0.36, -0.51, -0.89] }
            ],
            bonds: [[0, 1], [0, 2], [0, 3], [0, 4]]
        },
        ammonia: {
            name: 'Ammonia',
            formula: 'NH₃',
            description: 'Ammonia is a compound of nitrogen and hydrogen with a pungent smell. It has a trigonal pyramidal shape.',
            atoms: [
                { element: 'N', position: [0, 0, 0] },
                { element: 'H', position: [0.94, 0.27, 0] },
                { element: 'H', position: [-0.47, 0.27, 0.81] },
                { element: 'H', position: [-0.47, 0.27, -0.81] }
            ],
            bonds: [[0, 1], [0, 2], [0, 3]]
        },
        carbonDioxide: {
            name: 'Carbon Dioxide',
            formula: 'CO₂',
            description: 'Carbon dioxide is a colorless gas produced by burning carbon and organic compounds. It has a linear structure.',
            atoms: [
                { element: 'C', position: [0, 0, 0] },
                { element: 'O', position: [-1.16, 0, 0] },
                { element: 'O', position: [1.16, 0, 0] }
            ],
            bonds: [[0, 1], [0, 2]]
        },
        ethanol: {
            name: 'Ethanol',
            formula: 'C₂H₅OH',
            description: 'Ethanol is the type of alcohol found in beverages. It consists of an ethyl group attached to a hydroxyl group.',
            atoms: [
                { element: 'C', position: [0, 0, 0] },
                { element: 'C', position: [1.52, 0, 0] },
                { element: 'O', position: [2.14, 1.21, 0] },
                { element: 'H', position: [-0.36, 0.51, 0.89] },
                { element: 'H', position: [-0.36, 0.51, -0.89] },
                { element: 'H', position: [-0.36, -1.03, 0] },
                { element: 'H', position: [1.88, -0.51, 0.89] },
                { element: 'H', position: [1.88, -0.51, -0.89] },
                { element: 'H', position: [3.1, 1.21, 0] }
            ],
            bonds: [[0, 1], [1, 2], [0, 3], [0, 4], [0, 5], [1, 6], [1, 7], [2, 8]]
        },
        benzene: {
            name: 'Benzene',
            formula: 'C₆H₆',
            description: 'Benzene is an aromatic hydrocarbon with a hexagonal planar ring structure and alternating double bonds.',
            atoms: [
                { element: 'C', position: [1.4, 0, 0] },
                { element: 'C', position: [0.7, 1.21, 0] },
                { element: 'C', position: [-0.7, 1.21, 0] },
                { element: 'C', position: [-1.4, 0, 0] },
                { element: 'C', position: [-0.7, -1.21, 0] },
                { element: 'C', position: [0.7, -1.21, 0] },
                { element: 'H', position: [2.48, 0, 0] },
                { element: 'H', position: [1.24, 2.15, 0] },
                { element: 'H', position: [-1.24, 2.15, 0] },
                { element: 'H', position: [-2.48, 0, 0] },
                { element: 'H', position: [-1.24, -2.15, 0] },
                { element: 'H', position: [1.24, -2.15, 0] }
            ],
            bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]
        },
        glucose: {
            name: 'Glucose',
            formula: 'C₆H₁₂O₆',
            description: 'Glucose is a simple sugar that is an important energy source for living organisms.',
            atoms: [
                { element: 'C', position: [0, 0, 0] },
                { element: 'C', position: [1.5, 0, 0] },
                { element: 'C', position: [2.25, 1.3, 0] },
                { element: 'C', position: [3.75, 1.3, 0] },
                { element: 'C', position: [4.5, 0, 0] },
                { element: 'C', position: [6, 0, 0] },
                { element: 'O', position: [-0.75, 1.3, 0] },
                { element: 'O', position: [1.5, -1.3, 0] },
                { element: 'O', position: [1.5, 2.6, 0] },
                { element: 'O', position: [4.5, 2.6, 0] },
                { element: 'O', position: [4.5, -1.3, 0] },
                { element: 'O', position: [6.75, 1.3, 0] },
                { element: 'H', position: [-0.5, -0.5, 0.9] },
                { element: 'H', position: [2, 0.5, 0.9] },
                { element: 'H', position: [2, 1.8, -0.9] },
                { element: 'H', position: [4, 0.8, 0.9] },
                { element: 'H', position: [5, 0.5, -0.9] },
                { element: 'H', position: [6.5, -0.5, 0.9] }
            ],
            bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]
        },
        caffeine: {
            name: 'Caffeine',
            formula: 'C₈H₁₀N₄O₂',
            description: 'Caffeine is a stimulant found in coffee, tea, and many soft drinks. It affects the central nervous system.',
            atoms: [
                { element: 'N', position: [0, 0, 0] },
                { element: 'C', position: [1.2, 0.7, 0] },
                { element: 'N', position: [2.4, 0, 0] },
                { element: 'C', position: [2.4, -1.4, 0] },
                { element: 'C', position: [1.2, -2.1, 0] },
                { element: 'N', position: [0, -1.4, 0] },
                { element: 'C', position: [3.6, -2.1, 0] },
                { element: 'N', position: [4.8, -1.4, 0] },
                { element: 'C', position: [4.8, 0, 0] },
                { element: 'C', position: [3.6, 0.7, 0] },
                { element: 'O', position: [1.2, 2.1, 0] },
                { element: 'O', position: [3.6, -3.5, 0] },
                { element: 'C', position: [-1.2, 0.7, 0] },
                { element: 'C', position: [-1.2, -2.1, 0] },
                { element: 'C', position: [6, -2.1, 0] }
            ],
            bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6], [6, 7], [7, 8], [8, 9], [9, 2], [1, 10], [6, 11], [0, 12], [5, 13], [7, 14]]
        },
        nacl: {
            name: 'Sodium Chloride',
            formula: 'NaCl',
            description: 'Common table salt, an ionic compound formed between sodium and chlorine atoms.',
            atoms: [
                { element: 'Na', position: [0, 0, 0] },
                { element: 'Cl', position: [2.36, 0, 0] }
            ],
            bonds: [[0, 1]]
        },
        ozone: {
            name: 'Ozone',
            formula: 'O₃',
            description: 'Ozone is a molecule with three oxygen atoms. In the stratosphere, it protects Earth from UV radiation.',
            atoms: [
                { element: 'O', position: [0, 0, 0] },
                { element: 'O', position: [1.28, 0, 0] },
                { element: 'O', position: [-0.64, 1.1, 0] }
            ],
            bonds: [[0, 1], [0, 2]]
        },
        sulfuricAcid: {
            name: 'Sulfuric Acid',
            formula: 'H₂SO₄',
            description: 'Sulfuric acid is a strong mineral acid with wide industrial applications.',
            atoms: [
                { element: 'S', position: [0, 0, 0] },
                { element: 'O', position: [1.43, 0, 0] },
                { element: 'O', position: [-1.43, 0, 0] },
                { element: 'O', position: [0, 1.43, 0] },
                { element: 'O', position: [0, -1.43, 0] },
                { element: 'H', position: [0.97, 1.9, 0] },
                { element: 'H', position: [-0.97, -1.9, 0] }
            ],
            bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [3, 5], [4, 6]]
        },
        acetone: {
            name: 'Acetone',
            formula: 'C₃H₆O',
            description: 'Acetone is a colorless, volatile liquid commonly used as a solvent, such as in nail polish remover.',
            atoms: [
                { element: 'C', position: [0, 0, 0] },
                { element: 'C', position: [1.52, 0, 0] },
                { element: 'C', position: [-1.52, 0, 0] },
                { element: 'O', position: [0, 1.21, 0] },
                { element: 'H', position: [1.88, 0.51, 0.89] },
                { element: 'H', position: [1.88, 0.51, -0.89] },
                { element: 'H', position: [1.88, -1.03, 0] },
                { element: 'H', position: [-1.88, 0.51, 0.89] },
                { element: 'H', position: [-1.88, 0.51, -0.89] },
                { element: 'H', position: [-1.88, -1.03, 0] }
            ],
            bonds: [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [1, 6], [2, 7], [2, 8], [2, 9]]
        }
    };

    // Initialize Three.js
    function init() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // Camera
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 8;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        // Molecule group
        moleculeGroup = new THREE.Group();
        scene.add(moleculeGroup);

        // Event listeners
        setupEventListeners();

        // Render loop
        animate();

        // Initialize UI
        renderPresetMolecules();
        renderAtomLegend();

        // Load default molecule
        loadMolecule('water');
    }

    function setupEventListeners() {
        // Mouse controls
        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseup', onMouseUp);
        container.addEventListener('wheel', onMouseWheel);
        container.addEventListener('mouseleave', onMouseUp);

        // Touch controls
        container.addEventListener('touchstart', onTouchStart);
        container.addEventListener('touchmove', onTouchMove);
        container.addEventListener('touchend', onTouchEnd);

        // Buttons
        resetViewBtn.addEventListener('click', resetView);
        toggleRotationBtn.addEventListener('click', toggleAutoRotation);

        // Window resize
        window.addEventListener('resize', onWindowResize);
    }

    function onMouseDown(event) {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    function onMouseMove(event) {
        if (!isDragging) return;

        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        moleculeGroup.rotation.y += deltaMove.x * 0.01;
        moleculeGroup.rotation.x += deltaMove.y * 0.01;

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onMouseWheel(event) {
        event.preventDefault();
        camera.position.z += event.deltaY * 0.01;
        camera.position.z = Math.max(3, Math.min(20, camera.position.z));
    }

    let touchStartDistance = 0;

    function onTouchStart(event) {
        if (event.touches.length === 1) {
            isDragging = true;
            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            touchStartDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
            );
        }
    }

    function onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && isDragging) {
            const deltaMove = {
                x: event.touches[0].clientX - previousMousePosition.x,
                y: event.touches[0].clientY - previousMousePosition.y
            };

            moleculeGroup.rotation.y += deltaMove.x * 0.01;
            moleculeGroup.rotation.x += deltaMove.y * 0.01;

            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            const currentDistance = Math.hypot(
                event.touches[0].clientX - event.touches[1].clientX,
                event.touches[0].clientY - event.touches[1].clientY
            );
            const delta = touchStartDistance - currentDistance;
            camera.position.z += delta * 0.02;
            camera.position.z = Math.max(3, Math.min(20, camera.position.z));
            touchStartDistance = currentDistance;
        }
    }

    function onTouchEnd() {
        isDragging = false;
    }

    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (isAutoRotating) {
            moleculeGroup.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }

    function loadMolecule(moleculeKey) {
        const molecule = molecules[moleculeKey];
        if (!molecule) return;

        // Clear existing molecule
        while (moleculeGroup.children.length > 0) {
            moleculeGroup.remove(moleculeGroup.children[0]);
        }

        // Create atoms
        molecule.atoms.forEach((atom, index) => {
            const atomInfo = atomData[atom.element] || { color: 0x808080, radius: 0.5 };
            const geometry = new THREE.SphereGeometry(atomInfo.radius * 0.5, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: atomInfo.color,
                shininess: 80,
                specular: 0x444444
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(...atom.position);
            moleculeGroup.add(sphere);
        });

        // Create bonds
        molecule.bonds.forEach(([atom1Index, atom2Index]) => {
            const atom1 = molecule.atoms[atom1Index];
            const atom2 = molecule.atoms[atom2Index];

            const start = new THREE.Vector3(...atom1.position);
            const end = new THREE.Vector3(...atom2.position);
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();

            const geometry = new THREE.CylinderGeometry(0.08, 0.08, length, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x888888,
                shininess: 50
            });
            const cylinder = new THREE.Mesh(geometry, material);

            // Position and orient the bond
            cylinder.position.copy(start).add(direction.multiplyScalar(0.5));
            cylinder.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize()
            );

            moleculeGroup.add(cylinder);
        });

        // Update UI
        moleculeNameEl.textContent = molecule.name;
        updateMoleculeInfo(molecule);

        // Reset view
        moleculeGroup.rotation.set(0, 0, 0);
        camera.position.z = 8;
    }

    function updateMoleculeInfo(molecule) {
        moleculeInfoEl.classList.remove('hidden');

        document.getElementById('info-formula').textContent = molecule.formula;
        document.getElementById('info-atoms').textContent = molecule.atoms.length;
        document.getElementById('info-bonds').textContent = molecule.bonds.length;

        // Calculate molecular mass
        let mass = 0;
        molecule.atoms.forEach(atom => {
            const atomInfo = atomData[atom.element];
            if (atomInfo) mass += atomInfo.mass;
        });
        document.getElementById('info-mass').textContent = mass.toFixed(2);

        document.getElementById('info-description').textContent = molecule.description;
    }

    function resetView() {
        moleculeGroup.rotation.set(0, 0, 0);
        camera.position.z = 8;
    }

    function toggleAutoRotation() {
        isAutoRotating = !isAutoRotating;
        toggleRotationBtn.innerHTML = isAutoRotating
            ? '<i class="fas fa-pause mr-1"></i>Stop Rotation'
            : '<i class="fas fa-play mr-1"></i>Auto Rotate';
    }

    function renderPresetMolecules() {
        const icons = {
            water: 'fa-droplet',
            methane: 'fa-fire',
            ammonia: 'fa-wind',
            carbonDioxide: 'fa-smog',
            ethanol: 'fa-wine-glass',
            benzene: 'fa-ring',
            glucose: 'fa-cookie',
            caffeine: 'fa-coffee',
            nacl: 'fa-cubes',
            ozone: 'fa-cloud',
            sulfuricAcid: 'fa-flask',
            acetone: 'fa-vial'
        };

        presetMoleculesEl.innerHTML = Object.entries(molecules).map(([key, mol]) => `
            <button class="molecule-card p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg text-center transition-colors" data-molecule="${key}">
                <i class="fas ${icons[key] || 'fa-atom'} text-2xl text-indigo-500 mb-2"></i>
                <div class="text-sm font-medium text-gray-700">${mol.name}</div>
                <div class="text-xs text-gray-400">${mol.formula}</div>
            </button>
        `).join('');

        presetMoleculesEl.querySelectorAll('.molecule-card').forEach(btn => {
            btn.addEventListener('click', () => {
                loadMolecule(btn.dataset.molecule);
            });
        });
    }

    function renderAtomLegend() {
        atomLegendEl.innerHTML = Object.entries(atomData).map(([symbol, data]) => `
            <div class="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                <div class="w-4 h-4 rounded-full" style="background-color: #${data.color.toString(16).padStart(6, '0')}"></div>
                <span class="text-sm font-medium">${symbol}</span>
                <span class="text-xs text-gray-400">${data.name}</span>
            </div>
        `).join('');
    }

    // Initialize
    init();
});
