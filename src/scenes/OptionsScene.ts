import Phaser from 'phaser';

export class OptionsScene extends Phaser.Scene {
    private soundOn: boolean = true; // Placeholder state
    private musicOn: boolean = true; // Placeholder state

    private soundText!: Phaser.GameObjects.Text; // Declare text objects
    private musicText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'OptionsScene' });
    }

    preload() {
        console.log('OptionsScene preload');
    }

    create() {
        console.log('OptionsScene create');

        const { width, height } = this.sys.game.config;
        const screenCenterX = Number(width) / 2;
        const screenCenterY = Number(height) / 2;

        // --- Options Title ---
        this.add.text(screenCenterX, screenCenterY - 200, 'Options', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // --- Option Buttons ---
        const buttonOffsetY = -50;
        const buttonSpacing = 60;
        const buttonStyle = { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', align: 'center' };
        const buttonHoverStyle = { ...buttonStyle, color: '#ff8800' };

        // Sound Toggle
        this.soundText = this.add.text(screenCenterX, screenCenterY + buttonOffsetY, `Sound: ${this.soundOn ? 'On' : 'Off'}`, buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.soundText.on('pointerover', () => this.soundText.setStyle(buttonHoverStyle));
        this.soundText.on('pointerout', () => this.soundText.setStyle(buttonStyle));
        this.soundText.on('pointerdown', () => {
            this.soundOn = !this.soundOn;
            this.soundText.setText(`Sound: ${this.soundOn ? 'On' : 'Off'}`);
            console.log(`Sound toggled: ${this.soundOn ? 'On' : 'Off'}`);
            // Later: Implement actual sound muting/unmuting
        });

        // Music Toggle
        this.musicText = this.add.text(screenCenterX, screenCenterY + buttonOffsetY + buttonSpacing, `Music: ${this.musicOn ? 'On' : 'Off'}`, buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.musicText.on('pointerover', () => this.musicText.setStyle(buttonHoverStyle));
        this.musicText.on('pointerout', () => this.musicText.setStyle(buttonStyle));
        this.musicText.on('pointerdown', () => {
            this.musicOn = !this.musicOn;
            this.musicText.setText(`Music: ${this.musicOn ? 'On' : 'Off'}`);
            console.log(`Music toggled: ${this.musicOn ? 'On' : 'Off'}`);
            // Later: Implement actual music muting/unmuting
        });

        // Back Button
        const backButton = this.add.text(screenCenterX, screenCenterY + buttonOffsetY + (buttonSpacing * 3), 'Back', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => backButton.setStyle(buttonHoverStyle));
        backButton.on('pointerout', () => backButton.setStyle(buttonStyle));
        backButton.on('pointerdown', () => {
            console.log('Back button clicked');
            this.scene.start('MainMenuScene'); // Go back to Main Menu
        });
    }
} 