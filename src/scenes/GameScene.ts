import Phaser from 'phaser';

// Define Resource Types (simple version)
enum ResourceType {
    Iron = 'Iron',
    Copper = 'Copper'
}

// Define Tile Types
const TILE_SIZE = 64; // Assuming 64x64 based on common asset packs
enum TileType {
    Grass = 0,
    Water = 1,
    // Rock = 2 // Add more later
}

// --- Game Data Definitions ---

// Resources
interface ResourceConfig {
    key: string; // Internal key, e.g., 'iron'
    displayName: string;
    textureKey: string; // Key used in preload/add.image, e.g., 'node1'
    tier: number;
}

const Resources: ResourceConfig[] = [
    { key: 'res1', displayName: 'Iron Ore', textureKey: 'node1', tier: 1 },
    { key: 'res2', displayName: 'Copper Ore', textureKey: 'node2', tier: 1 },
    { key: 'res3', displayName: 'Coal', textureKey: 'node3', tier: 2 },
    { key: 'res4', displayName: 'Stone', textureKey: 'node4', tier: 2 },
    { key: 'res5', displayName: 'Sulfur', textureKey: 'node5', tier: 3 },
    // ... Add entries for nodes 6-15 ...
    { key: 'res15', displayName: 'Resource 15', textureKey: 'node15', tier: 8 }, // Example placeholder
];

// Belts
interface BeltConfig {
    key: string; // e.g., 'belt_t1'
    textureKey: string; // e.g., 'belt1'
    speed: number; // tiles per second (placeholder)
    tier: number;
}

const Belts: BeltConfig[] = [
    { key: 'belt_t1', textureKey: 'belt1', speed: 1, tier: 1 },
    { key: 'belt_t2', textureKey: 'belt2', speed: 2, tier: 2 },
    { key: 'belt_t3', textureKey: 'belt3', speed: 3, tier: 3 },
    { key: 'belt_t4', textureKey: 'belt4', speed: 4, tier: 4 },
    { key: 'belt_t5', textureKey: 'belt5', speed: 5, tier: 5 },
];

// --- End Game Data Definitions ---

export class GameScene extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // Standard cursor keys (includes WASD)
    private cameraSpeed = 500; // Pixels per second
    private worldSize = { width: 3000, height: 3000 }; // Define the size of the game world
    private gridSize = TILE_SIZE; // Set gridSize to match TILE_SIZE
    private isPaused = false; // Pause state flag
    private pauseMenuGroup!: Phaser.GameObjects.Group; // Group for pause menu elements
    private tilemap!: Phaser.Tilemaps.Tilemap; // Reference to the tilemap
    private terrainLayer!: Phaser.Tilemaps.TilemapLayer; // Reference to the terrain layer
    private mapData: TileType[][] = []; // 2D array for map data

    // Zoom properties
    private minZoom = 0.5;
    private maxZoom = 1.5;
    private zoomIncrement = 0.1;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: any) {
        // This method receives data passed from the scene that started this one
        console.log('GameScene init, data:', data);
        if (data.loadSlot) {
            console.log(`--- Loading game from slot ${data.loadSlot} ---`);
            // Later: Implement actual loading logic using the slot ID
        } else {
            console.log('--- Starting new game ---');
            // Later: Implement new game setup
        }
    }

    preload() {
        console.log('GameScene preload');

        // --- Load Assets --- 
        // Tiles
        this.load.image('grass', 'assets/grass.png');
        this.load.image('water', 'assets/water.png');

        // Nodes (Loading all 15)
        for (let i = 1; i <= 15; i++) {
            this.load.image(`node${i}`, `assets/node${i}.png`);
        }

        // Belts (Loading all 5)
        for (let i = 1; i <= 5; i++) {
            this.load.image(`belt${i}`, `assets/belt${i}.png`);
        }

        // Buildings
        this.load.image('basicMiner', 'assets/floor_chest.png'); // Keeping placeholder
        this.load.image('hub', 'assets/floor_campfire.png'); // Keeping placeholder

        // --- REMOVE Old Node Placeholders ---
        // this.load.image('ironNode', ...) 
        // this.load.image('copperNode', ...)
    }

    create() {
        console.log('GameScene create');
        this.isPaused = false;

        // --- Launch UI Scene --- 
        this.scene.launch('UIScene');
        const uiScene = this.scene.get('UIScene'); // Get reference for event listener

        // Listen for pause request from UI
        uiScene?.events.on('togglePauseRequest', () => {
            this.togglePauseMenu();
        });

        // --- World Setup ---
        // Set the boundaries of our game world
        this.physics.world.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
        // Set the boundaries for the camera
        this.cameras.main.setBounds(0, 0, this.worldSize.width, this.worldSize.height);

        // --- Generate and Create Tilemap --- 
        this.generateMapData();
        this.tilemap = this.make.tilemap({ data: this.mapData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
        const tilesetGrass = this.tilemap.addTilesetImage('grass', 'grass'); // Use loaded image key 'grass'
        const tilesetWater = this.tilemap.addTilesetImage('water', 'water'); // Use loaded image key 'water'

        if (!tilesetGrass || !tilesetWater) {
            console.error('Failed to load tile textures!');
            return;
        }

        const layer = this.tilemap.createLayer(0, [tilesetGrass, tilesetWater], 0, 0);
        if (!layer) {
             console.error('Failed to create terrain layer!');
             return; // Stop creation if layer failed
        }
        this.terrainLayer = layer; // Assign only if valid
        this.terrainLayer.setDepth(-1); // Ensure background is behind everything

        // --- Input Setup ---
        // Enable cursor keys (includes WASD mapping)
        this.cursors = this.input.keyboard!.createCursorKeys();
        // Also map WASD keys manually for more explicit control if needed
        // this.input.keyboard.addKeys('W,A,S,D'); // Not strictly needed if using createCursorKeys()

        // Mouse Input Listeners
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isPaused) return;
            if (pointer.leftButtonDown()) {
                // Calculate grid cell coordinates from world coordinates
                const worldX = pointer.worldX;
                const worldY = pointer.worldY;
                const gridX = Math.floor(worldX / this.gridSize);
                const gridY = Math.floor(worldY / this.gridSize);

                // Calculate the snapped position (center of the grid cell)
                const snappedX = gridX * this.gridSize + this.gridSize / 2;
                const snappedY = gridY * this.gridSize + this.gridSize / 2;

                console.log(`Left mouse button clicked at world (${worldX.toFixed(0)}, ${worldY.toFixed(0)}) -> grid (${gridX}, ${gridY}) -> placing at (${snappedX}, ${snappedY})`);

                console.log(`Placing basic miner...`);
                this.add.image(snappedX, snappedY, 'basicMiner'); // Use loaded image key 'basicMiner'
            } else if (pointer.middleButtonDown()) {
                console.log('Middle mouse button clicked at:', pointer.worldX, pointer.worldY);
                // Later: Potentially rotate selected item? (View rotation is less common in 2D top-down)
            } else if (pointer.rightButtonDown()) {
                console.log('Right mouse button clicked at:', pointer.worldX, pointer.worldY);
                 // Later: Cancel action or open context menu
            }
        });

        // Mouse Wheel Zoom Listener
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
            if (this.isPaused) return; // Ignore zoom when paused

            let newZoom = this.cameras.main.zoom;
            if (deltaY < 0) {
                newZoom += this.zoomIncrement;
            } else if (deltaY > 0) {
                newZoom -= this.zoomIncrement;
            }

            // Clamp zoom level
            this.cameras.main.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
        });

        // --- Initial Camera Position ---
        this.cameras.main.centerOn(this.worldSize.width / 2, this.worldSize.height / 2);

        // --- Spawn Initial Resources (Check terrain) ---
        this.spawnResourceNodes();

        // --- Place Central Hub (Check terrain) ---
        const centerGridX = Math.floor((this.worldSize.width / 2) / this.gridSize);
        const centerGridY = Math.floor((this.worldSize.height / 2) / this.gridSize);
        if (this.mapData[centerGridY]?.[centerGridX] !== TileType.Water) {
            const hubX = centerGridX * this.gridSize + this.gridSize / 2; // Center in the cell
            const hubY = centerGridY * this.gridSize + this.gridSize / 2;
            this.add.image(hubX, hubY, 'hub'); // Use loaded image key 'hub'
            console.log(`Placed Hub at grid (${centerGridX}, ${centerGridY})`);
        } else {
            console.warn(`Could not place Hub at (${centerGridX}, ${centerGridY}) - location is water.`);
        }

        // --- Create Pause Menu (Initially Hidden) ---
        this.createPauseMenu();
    }

    togglePauseMenu() {
        this.isPaused = !this.isPaused;
        console.log('Paused:', this.isPaused);
        this.pauseMenuGroup.setVisible(this.isPaused);

        if (this.isPaused) {
            // Optional: Pause game physics/animations if needed
             this.physics.pause();
        } else {
            // Optional: Resume game physics/animations
             this.physics.resume();
        }
    }

    createPauseMenu() {
        this.pauseMenuGroup = this.add.group();

        const menuWidth = 300;
        const menuHeight = 250;
        const screenCenterX = this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.height / 2;

        // Semi-transparent background
        const bg = this.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRect(screenCenterX - menuWidth / 2, screenCenterY - menuHeight / 2, menuWidth, menuHeight)
            .setScrollFactor(0)
            .setDepth(100); // Ensure background is below buttons but above game

        // Menu Title
        const title = this.add.text(screenCenterX, screenCenterY - menuHeight / 2 + 30, 'Paused', {
            fontFamily: 'Arial', fontSize: '32px', color: '#ffffff'
        })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setDepth(101);

        // Button Styles
        const buttonStyle = { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', backgroundColor: '#555555', padding: { left: 10, right: 10, top: 5, bottom: 5 }, fixedWidth: 150, align: 'center' };
        const buttonHoverStyle = { ...buttonStyle, backgroundColor: '#777777' };
        const buttonYStart = screenCenterY - menuHeight/2 + 80;
        const buttonSpacing = 50;

        // Resume Button
        const resumeButton = this.add.text(screenCenterX, buttonYStart, 'Resume', buttonStyle)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => resumeButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => resumeButton.setStyle(buttonStyle))
            .on('pointerdown', () => this.togglePauseMenu());

        // Save Game Button
        const saveButton = this.add.text(screenCenterX, buttonYStart + buttonSpacing, 'Save Game', buttonStyle)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => saveButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => saveButton.setStyle(buttonStyle))
            .on('pointerdown', () => {
                console.log('Save Game clicked! (Not implemented yet)');
                // Later: Add actual save logic
                this.togglePauseMenu(); // Close menu after clicking
            });

        // Main Menu Button
        const mainMenuButton = this.add.text(screenCenterX, buttonYStart + buttonSpacing * 2, 'Main Menu', buttonStyle)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => mainMenuButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => mainMenuButton.setStyle(buttonStyle))
            .on('pointerdown', () => {
                this.isPaused = false; // Ensure unpaused before leaving scene
                this.physics.resume(); // Ensure physics are running before leaving
                this.scene.stop('UIScene'); // Stop the UI scene as well
                this.scene.start('MainMenuScene');
            });

        // Add all elements to the group
        this.pauseMenuGroup.addMultiple([bg, title, resumeButton, saveButton, mainMenuButton]);

        // Start hidden
        this.pauseMenuGroup.setVisible(false);
    }

    generateMapData() {
        const mapWidthInTiles = this.worldSize.width / TILE_SIZE;
        const mapHeightInTiles = this.worldSize.height / TILE_SIZE;
        this.mapData = [];

        for (let y = 0; y < mapHeightInTiles; y++) {
            const row: TileType[] = [];
            for (let x = 0; x < mapWidthInTiles; x++) {
                // --- Simplified Logic: Small chance for water ---
                let tile = TileType.Grass;
                if (Math.random() < 0.03) { // ~3% chance for any tile to be water
                     tile = TileType.Water;
                }
                // --- End Simplified Logic ---

                row.push(tile);
            }
            this.mapData.push(row);
            // --- DEBUG LOG: Print first few rows ---
            if (y < 5) {
                console.log(`Map Row ${y}:`, row.slice(0, 10).join(',')); // Print first 10 tiles of first 5 rows
            }
            // --- END DEBUG LOG ---
        }
        console.log(`Generated map data ${mapWidthInTiles}x${mapHeightInTiles}`);
    }

    spawnResourceNodes() {
        console.log('Spawning resource nodes...');
        const occupiedCells = new Set<string>();

        // Reserve center cell for Hub
        const centerGridX = Math.floor((this.worldSize.width / 2) / this.gridSize);
        const centerGridY = Math.floor((this.worldSize.height / 2) / this.gridSize);
        if (this.mapData[centerGridY]?.[centerGridX] !== TileType.Water) {
             occupiedCells.add(`${centerGridX},${centerGridY}`);
        }
        // Add adjacent cells if Hub is larger than 1x1 grid conceptually
        // occupiedCells.add(`${centerGridX+1},${centerGridY}`);
        // occupiedCells.add(`${centerGridX},${centerGridY+1}`);
        // occupiedCells.add(`${centerGridX+1},${centerGridY+1}`);

        // Define which resource tiers to spawn initially
        const tiersToSpawn = [1, 2]; // Only spawn Tier 1 and Tier 2 nodes initially
        const nodesPerTier = 15; // Example: Aim for 15 nodes per tier

        Resources.forEach(resource => {
            if (tiersToSpawn.includes(resource.tier)) {
                let placed = 0;
                let attempts = 0;
                const maxAttempts = nodesPerTier * 5; 

                while (placed < nodesPerTier && attempts < maxAttempts) {
                    attempts++;
                    const randGridX = Phaser.Math.Between(0, (this.worldSize.width / this.gridSize) - 1);
                    const randGridY = Phaser.Math.Between(0, (this.worldSize.height / this.gridSize) - 1);
                    const cellKey = `${randGridX},${randGridY}`;

                    if (!occupiedCells.has(cellKey) && this.mapData[randGridY]?.[randGridX] !== TileType.Water) {
                        occupiedCells.add(cellKey);
                        const nodeX = randGridX * this.gridSize + this.gridSize / 2;
                        const nodeY = randGridY * this.gridSize + this.gridSize / 2;
                        this.add.image(nodeX, nodeY, resource.textureKey); // Use textureKey from Resource config
                        // Later: Store node data { type: resource.key, amount: defaultAmount, x, y }
                        placed++;
                    }
                }
                if (placed < nodesPerTier) {
                    console.warn(`Could only place ${placed}/${nodesPerTier} ${resource.displayName} nodes.`);
                }
            }
        });

        console.log('Finished spawning nodes.');
    }

    update(time: number, delta: number) {
        // --- Camera Movement (Only when not paused) ---
        if (!this.isPaused) { // Check if paused
            const dt = delta / 1000;
            let dx = 0;
            let dy = 0;

            if (this.cursors.left.isDown || this.input.keyboard?.addKey('A').isDown) {
                dx = -1;
            } else if (this.cursors.right.isDown || this.input.keyboard?.addKey('D').isDown) {
                dx = 1;
            }

            if (this.cursors.up.isDown || this.input.keyboard?.addKey('W').isDown) {
                dy = -1;
            } else if (this.cursors.down.isDown || this.input.keyboard?.addKey('S').isDown) {
                dy = 1;
            }

            // Normalize diagonal movement speed (optional but good)
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 0) {
                dx = (dx / magnitude) * this.cameraSpeed * dt;
                dy = (dy / magnitude) * this.cameraSpeed * dt;
            }

            this.cameras.main.scrollX += dx;
            this.cameras.main.scrollY += dy;
        } // End of !isPaused check

        // --- Update Coordinate Display (Emit event instead) ---
        const worldPoint = this.cameras.main.getWorldPoint(this.cameras.main.centerX, this.cameras.main.centerY);
        this.events.emit('cameraCoordsUpdate', { x: worldPoint.x, y: worldPoint.y }); // Emit event
    }
} 