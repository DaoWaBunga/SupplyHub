import Phaser from 'phaser';

// Define Resource Types (simple version)
enum ResourceType {
    Iron = 'Iron',
    Copper = 'Copper'
}

// Define Tile Types
const TILE_SIZE = 64;
enum TileType {
    Grass = 0,
    // Water = 1, // Remove Water
}

// --- Game Data Definitions ---

// Resources
interface ResourceConfig {
    key: string;
    displayName: string;
    textureKey: string;
    tier: number;
}
const Resources: ResourceConfig[] = [
    { key: 'res1', displayName: 'Generic Node', textureKey: 'node1', tier: 1 },
    // Only define one type for now, using node1 texture
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
    private worldSize = { width: 3200, height: 3200 }; // Adjusted to be multiple of TILE_SIZE (64*50)
    private gridSize = TILE_SIZE; // Set gridSize to match TILE_SIZE
    private isPaused = false; // Pause state flag
    private pauseMenuGroup!: Phaser.GameObjects.Group; // Group for pause menu elements
    private tilemap!: Phaser.Tilemaps.Tilemap; // Reference to the tilemap
    private terrainLayer!: Phaser.Tilemaps.TilemapLayer; // Reference to the terrain layer
    private mapData: TileType[][] = []; // 2D array for map data
    private selectedBuildItem: string | null = null;
    private buildPreviewSprite: Phaser.GameObjects.Image | null = null; // Sprite attached to cursor

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
        // this.load.image('water', 'assets/water.png'); // Remove Water loading

        // Nodes (Loading only node1 for now)
        this.load.image('node1', `assets/node1.png`);
        // Remove loop for nodes 2-15

        // Belts (Keep loading 1-5)
        for (let i = 1; i <= 5; i++) {
            this.load.image(`belt${i}`, `assets/belt${i}.png`);
        }

        // Buildings
        this.load.image('buildMiner', 'assets/miner.png');
        this.load.image('hub', 'assets/dragon.png'); // Use dragon.png for Hub
    }

    create() {
        console.log('GameScene create');
        this.isPaused = false;

        // --- Launch UI Scene --- 
        this.scene.launch('UIScene');
        const uiScene = this.scene.get('UIScene'); // Get reference for event listener

        // Listen for pause request from UI
        uiScene?.events.on('togglePauseRequest', () => {
            console.log('GameScene received togglePauseRequest');
            this.togglePauseMenu();
        });
        // Listen for build item selection from UI
        uiScene?.events.on('selectBuildItem', (itemKey: string) => {
            console.log('GameScene received selectBuildItem:', itemKey);

            // Destroy previous preview if any
            if (this.buildPreviewSprite) {
                this.buildPreviewSprite.destroy();
                this.buildPreviewSprite = null;
            }

            // Toggle selection
            if (this.selectedBuildItem === itemKey) {
                this.selectedBuildItem = null;
                console.log('GameScene: Deselected item.');
                this.input.setDefaultCursor('default'); // Show default cursor
            } else {
                this.selectedBuildItem = itemKey;
                console.log(`GameScene: Selected item ${this.selectedBuildItem}`);
                // Create preview sprite
                this.buildPreviewSprite = this.add.image(0, 0, this.selectedBuildItem);
                this.buildPreviewSprite.setAlpha(0.6); // Make it semi-transparent
                this.buildPreviewSprite.setDepth(50); // Ensure visible
                this.input.setDefaultCursor('none'); // Hide default cursor
            }
        });

        // --- World Setup ---
        // Set the boundaries of our game world
        this.physics.world.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
        // Set the boundaries for the camera
        this.cameras.main.setBounds(0, 0, this.worldSize.width, this.worldSize.height);

        // --- Generate and Create Tilemap (Grass Only) --- 
        this.generateMapData();
        this.tilemap = this.make.tilemap({ data: this.mapData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
        const tilesetGrass = this.tilemap.addTilesetImage('grass', 'grass');
        // const tilesetWater = ... Remove water tileset

        if (!tilesetGrass /* || !tilesetWater */) { // Remove water check
            console.error('Failed to load grass tile texture!'); // Update error message
            return;
        }

        const layer = this.tilemap.createLayer(0, [tilesetGrass /*, tilesetWater*/], 0, 0); // Only use grass tileset
        if (!layer) {
             console.error('Failed to create terrain layer!');
             return;
        }
        this.terrainLayer = layer;
        this.terrainLayer.setDepth(-1);

        // Prevent default right-click context menu on the game canvas
        this.input.manager.contextMenu.disable = true;

        // --- Input Setup ---
        // Enable cursor keys (includes WASD mapping)
        this.cursors = this.input.keyboard!.createCursorKeys();
        // Also map WASD keys manually for more explicit control if needed
        // this.input.keyboard.addKeys('W,A,S,D'); // Not strictly needed if using createCursorKeys()

        // Mouse Input Listeners
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isPaused) return;

            if (pointer.leftButtonDown()) {
                if (this.selectedBuildItem) {
                    // Calculate grid position
                    const worldX = pointer.worldX;
                    const worldY = pointer.worldY;
                    const gridX = Math.floor(worldX / this.gridSize);
                    const gridY = Math.floor(worldY / this.gridSize);
                    const snappedX = gridX * this.gridSize + this.gridSize / 2;
                    const snappedY = gridY * this.gridSize + this.gridSize / 2;

                    // --- Placement Logic ---
                    // Check if the selected item is the buildable miner
                    if (this.selectedBuildItem === 'buildMiner') {
                        // Placement validation (No longer need water check)
                        if (/* this.mapData[gridY]?.[gridX] !== TileType.Water && */ true /* && !isCellOccupied(gridX, gridY) */) {
                            console.log(`Placing ${this.selectedBuildItem} at grid (${gridX}, ${gridY})`);
                            this.add.image(snappedX, snappedY, this.selectedBuildItem); // Use the selected item key
                            // TODO: Add placed miner to a list/manager
                            // TODO: Check adjacency to resource node
                            this.selectedBuildItem = null; // Clear selection after placing
                            console.log('Cleared build selection.');
                        } else {
                            console.log('Cannot place miner here (occupied?).'); // Update log message
                        }
                    } else {
                        console.log(`Placement logic for ${this.selectedBuildItem} not implemented yet.`);
                    }
                    // --- End Placement Logic ---

                } else {
                    // If nothing is selected, maybe handle object selection/interaction?
                    console.log('Left click with nothing selected.');
                }

            } else if (pointer.middleButtonDown()) {
                console.log('Middle mouse button clicked at:', pointer.worldX, pointer.worldY);
                // Later: Potentially rotate selected item? (View rotation is less common in 2D top-down)
            } else if (pointer.rightButtonDown()) {
                if (this.selectedBuildItem) {
                    console.log('Cancelled build selection.');
                    this.selectedBuildItem = null;
                    if (this.buildPreviewSprite) { // Destroy preview on cancel
                        this.buildPreviewSprite.destroy();
                        this.buildPreviewSprite = null;
                    }
                    this.input.setDefaultCursor('default'); // Show default cursor
                } else {
                    console.log('Right mouse button clicked at:', pointer.worldX, pointer.worldY);
                }
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

        // --- Place Central Hub --- 
        const centerGridX = Math.floor((this.worldSize.width / 2) / this.gridSize);
        const centerGridY = Math.floor((this.worldSize.height / 2) / this.gridSize);
        // No water check needed
        const hubX = centerGridX * this.gridSize + this.gridSize / 2;
        const hubY = centerGridY * this.gridSize + this.gridSize / 2;
        this.add.image(hubX, hubY, 'hub'); // Uses 'hub' key which now loads dragon.png
        console.log(`Placed Hub at grid (${centerGridX}, ${centerGridY})`);

        // --- Spawn Initial Resources --- 
        this.spawnResourceNodes();

        // --- Create Pause Menu (Initially Hidden) ---
        this.createPauseMenu();

        // Prevent browser right-click menu on game canvas
        /* // Temporarily disable this check
        if (this.game.canvas) {
            this.game.canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        */
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
                row.push(TileType.Grass); // Always push Grass
            }
            this.mapData.push(row);
            // Remove debug log if desired
        }
        console.log(`Generated map data ${mapWidthInTiles}x${mapHeightInTiles} (All Grass)`);
    }

    spawnResourceNodes() {
        console.log('Spawning resource nodes...');
        const occupiedCells = new Set<string>();
        const numNodesToSpawn = 30; // Total number of nodes (using node1 texture)

        // Reserve center cell for Hub
        const centerGridX = Math.floor((this.worldSize.width / 2) / this.gridSize);
        const centerGridY = Math.floor((this.worldSize.height / 2) / this.gridSize);
        occupiedCells.add(`${centerGridX},${centerGridY}`);

        let placed = 0;
        let attempts = 0;
        const maxAttempts = numNodesToSpawn * 5;
        const resource = Resources[0]; // Get the only defined resource config

        while (placed < numNodesToSpawn && attempts < maxAttempts) {
            attempts++;
            const randGridX = Phaser.Math.Between(0, (this.worldSize.width / this.gridSize) - 1);
            const randGridY = Phaser.Math.Between(0, (this.worldSize.height / this.gridSize) - 1);
            const cellKey = `${randGridX},${randGridY}`;

            // Check if cell is valid (not occupied, no water check needed)
            if (!occupiedCells.has(cellKey)) {
                occupiedCells.add(cellKey);
                const nodeX = randGridX * this.gridSize + this.gridSize / 2;
                const nodeY = randGridY * this.gridSize + this.gridSize / 2;
                this.add.image(nodeX, nodeY, resource.textureKey); // Always use node1 texture key
                placed++;
            }
        }
        if (placed < numNodesToSpawn) {
            console.warn(`Could only place ${placed}/${numNodesToSpawn} nodes.`);
        }
        console.log('Finished spawning nodes.');
    }

    update(time: number, delta: number) {
        // --- Update Build Preview Position --- 
        if (this.buildPreviewSprite && !this.isPaused) {
            const pointer = this.input.activePointer;
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const gridX = Math.floor(worldPoint.x / this.gridSize);
            const gridY = Math.floor(worldPoint.y / this.gridSize);
            const snappedX = gridX * this.gridSize + this.gridSize / 2;
            const snappedY = gridY * this.gridSize + this.gridSize / 2;
            this.buildPreviewSprite.setPosition(snappedX, snappedY);
        }

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