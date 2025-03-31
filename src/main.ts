import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene'; // Import the new scene
import { OptionsScene } from './scenes/OptionsScene'; // Import the new scene
import { LoadGameScene } from './scenes/LoadGameScene'; // Import the new scene
import { GameScene } from './scenes/GameScene'; // Import the new scene
import { UIScene } from './scenes/UIScene'; // Import the new scene

// Basic Scene placeholder
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load assets if needed for preloader
        console.log('BootScene preload');
    }

    create() {
        console.log('BootScene create - Starting Main Menu...');
        this.scene.start('MainMenuScene'); // Transition to the main menu
    }
}

// Phaser Game Configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Use WebGL if available, otherwise Canvas
    width: 1280,       // Game width in pixels
    height: 720,       // Game height in pixels
    parent: 'game-container', // ID of the DOM element to parent the canvas to (optional)
    scene: [BootScene, MainMenuScene, OptionsScene, LoadGameScene, GameScene, UIScene], // Add UIScene
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    backgroundColor: '#1a1a1a'
};

// Create the Phaser game instance
const game = new Phaser.Game(config);

console.log('Phaser game instance created:', game); 