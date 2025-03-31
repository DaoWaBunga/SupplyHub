import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // Preload assets for the menu if any (e.g., background image, button sprites)
        console.log('MainMenuScene preload');
    }

    create() {
        console.log('MainMenuScene create');

        // Get game dimensions
        const { width, height } = this.sys.game.config;
        const screenCenterX = Number(width) / 2;
        const screenCenterY = Number(height) / 2;

        // --- Menu Title ---
        this.add.text(screenCenterX, screenCenterY - 150, 'Supply Hub', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // --- Menu Buttons ---
        const buttonOffsetY = 50;
        const buttonSpacing = 60;

        // Style for buttons on hover/rest
        const buttonStyle = { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', align: 'center' };
        const buttonHoverStyle = { ...buttonStyle, color: '#ff8800' }; // Change color on hover

        // Start Game Button
        const startButton = this.add.text(screenCenterX, screenCenterY + buttonOffsetY, 'Start Game', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => startButton.setStyle(buttonHoverStyle));
        startButton.on('pointerout', () => startButton.setStyle(buttonStyle));
        startButton.on('pointerdown', () => {
            console.log('Start Game clicked!');
            this.scene.start('GameScene');
        });

        // Options Button
        const optionsButton = this.add.text(screenCenterX, screenCenterY + buttonOffsetY + buttonSpacing, 'Options', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        optionsButton.on('pointerover', () => optionsButton.setStyle(buttonHoverStyle));
        optionsButton.on('pointerout', () => optionsButton.setStyle(buttonStyle));
        optionsButton.on('pointerdown', () => {
            console.log('Options clicked!');
            this.scene.start('OptionsScene');
        });

        // Load Game Button
        const loadButton = this.add.text(screenCenterX, screenCenterY + buttonOffsetY + (buttonSpacing * 2), 'Load Game', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        loadButton.on('pointerover', () => loadButton.setStyle(buttonHoverStyle));
        loadButton.on('pointerout', () => loadButton.setStyle(buttonStyle));
        loadButton.on('pointerdown', () => {
            console.log('Load Game clicked!');
            this.scene.start('LoadGameScene');
        });

        // Exit Button (Note: Exiting isn't really feasible in a browser tab directly)
        // We'll just simulate it or make it inactive for web builds.
        const exitButton = this.add.text(screenCenterX, screenCenterY + buttonOffsetY + (buttonSpacing * 3), 'Exit', { ...buttonStyle, color: '#aaaaaa' }) // Greyed out
            .setOrigin(0.5);
        // exitButton.setInteractive({ useHandCursor: true }); // Not interactive for now
        // exitButton.on('pointerdown', () => console.log('Exit clicked - (Not functional in browser)'));
    }
} 