import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {

    // We'll need references to update these later
    private resourceTexts: { [key: string]: Phaser.GameObjects.Text } = {};
    private coordsText!: Phaser.GameObjects.Text; // Add reference for coords text

    constructor() {
        super({ key: 'UIScene' });
    }

    preload() {
        console.log('UIScene preload');
        // Load UI assets if needed (icons, button backgrounds, etc.)
    }

    create() {
        console.log('UIScene create');

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const gameScene = this.scene.get('GameScene'); // Get reference to GameScene
        const panelAlpha = 0.6; // Transparency for panels
        const panelColor = 0x000000; // Black background panels

        // --- Top-Left Panel (Coords + Resources) ---
        const topLeftPanelWidth = 150;
        const topLeftPanelHeight = 100; // Adjust as needed based on resource count
        this.add.graphics()
            .fillStyle(panelColor, panelAlpha)
            .fillRect(5, 5, topLeftPanelWidth, topLeftPanelHeight)
            .setScrollFactor(0)
            .setDepth(90); // Below text, above game

        // --- World Coordinates Display (Top-Left below resources) ---
        this.coordsText = this.add.text(10, 10, 'World: (0, 0)', { fontFamily: 'Arial', fontSize: '16px', color: '#ffff00' })
            .setScrollFactor(0)
            .setDepth(100);

        // --- Resource Tracker (Top-Left below Coords) ---
        const resourceStyle = { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff' };
        const resourcesToShow = ['Iron', 'Copper', 'Power'];
        let yPos = 35; // Adjusted Y start position
        for (const resource of resourcesToShow) {
            this.resourceTexts[resource] = this.add.text(10, yPos, `${resource}: 0`, resourceStyle)
                .setScrollFactor(0)
                .setDepth(100);
            yPos += 25;
        }

        // --- Hub Upgrade Button (Top-Center) ---
        const hubButtonStyle = { fontFamily: 'Arial', fontSize: '20px', color: '#ffffaa', backgroundColor: '#333333', padding: { left: 10, right: 10, top: 5, bottom: 5 } };
        const hubButtonHoverStyle = { ...hubButtonStyle, color: '#ffffff', backgroundColor: '#555555' };

        const hubButton = this.add.text(screenWidth / 2, 10, 'Hub Upgrades', hubButtonStyle)
            .setOrigin(0.5, 0) // Center horizontally, align to top
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);

        hubButton.on('pointerover', () => hubButton.setStyle(hubButtonHoverStyle));
        hubButton.on('pointerout', () => hubButton.setStyle(hubButtonStyle));
        hubButton.on('pointerdown', () => {
            console.log('Hub Upgrades button clicked!');
            // Later: Pause GameScene and start/show a modal HubUpgradeScene
        });

        // --- Menu Button (Top Right) ---
        const menuButtonWidth = 90;
        const menuButtonHeight = 40;
        this.add.graphics()
            .fillStyle(panelColor, panelAlpha)
            .fillRect(screenWidth - menuButtonWidth - 5, 5, menuButtonWidth, menuButtonHeight)
            .setScrollFactor(0)
            .setDepth(190); // Below menu button text

        const menuButton = this.add.text(screenWidth - 10, 10, 'Menu', {
            fontFamily: 'Arial', fontSize: '20px', color: '#ddddff',
            fixedWidth: 80,
            align: 'right'
        })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            console.log('UI: Menu button clicked, emitting togglePauseRequest');
            gameScene?.events.emit('togglePauseRequest'); // Emit event to GameScene
        })
        .setDepth(200);

        // --- Build Menu Placeholder (Bottom-Left) ---
        const buildMenuWidth = 250;
        const buildMenuHeight = 40;
        this.add.graphics()
            .fillStyle(panelColor, panelAlpha)
            .fillRect(5, screenHeight - buildMenuHeight - 5, buildMenuWidth, buildMenuHeight)
            .setScrollFactor(0)
            .setDepth(90);

        const buildMenuStyle = { fontFamily: 'Arial', fontSize: '20px', color: '#aaffaa'};
        this.add.text(10, screenHeight - 30, 'Build Menu Placeholder', buildMenuStyle)
            .setScrollFactor(0)
            .setDepth(91); // Above its panel

        // --- Listen for GameScene Events ---
        if (gameScene) {
            // Listen for Resource Updates
            gameScene.events.on('updateResource', (resource: string, amount: number) => {
                this.updateResourceDisplay(resource, amount);
            });
            // Listen for Coordinate Updates
            gameScene.events.on('cameraCoordsUpdate', (coords: {x: number, y: number}) => {
                this.updateCoords(coords.x, coords.y);
            });
        }
    }

    // Method to update the coordinates display
    updateCoords(x: number, y: number) {
        if (this.coordsText) {
            this.coordsText.setText(`World: (${Math.round(x)}, ${Math.round(y)})`);
        }
    }

    // Example function that could be called from GameScene or a data manager
    updateResourceDisplay(resource: string, amount: number) {
        if (this.resourceTexts[resource]) {
            this.resourceTexts[resource].setText(`${resource}: ${amount}`);
        } else {
            console.warn(`UI: Tried to update display for unknown resource '${resource}'`);
        }
    }
} 