import Phaser from 'phaser';

// Placeholder data for save slots
const MAX_SAVE_SLOTS = 3;
const saveSlotsData = Array(MAX_SAVE_SLOTS).fill(null).map((_, index) => ({
    id: index + 1,
    // In a real game, you'd load this data from localStorage or similar
    exists: Math.random() > 0.5, // Randomly decide if a slot exists for demo
    // timestamp: Date.now() // Example of other data you might store
}));


export class LoadGameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LoadGameScene' });
    }

    preload() {
        console.log('LoadGameScene preload');
    }

    create() {
        console.log('LoadGameScene create');

        const { width, height } = this.sys.game.config;
        const screenCenterX = Number(width) / 2;
        const screenCenterY = Number(height) / 2;

        // --- Title ---
        this.add.text(screenCenterX, screenCenterY - 250, 'Load Game', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // --- Save Slots ---
        const buttonOffsetY = -150;
        const buttonSpacing = 70; // Increased spacing for slot + delete button
        const buttonStyle = { fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', align: 'center' };
        const buttonHoverStyle = { ...buttonStyle, color: '#ff8800' };
        const deleteButtonStyle = { ...buttonStyle, fontSize: '24px', color: '#ff4444' };
        const deleteButtonHoverStyle = { ...deleteButtonStyle, color: '#ff8888' };
        const emptySlotStyle = { ...buttonStyle, color: '#888888' };

        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            const slotData = saveSlotsData[i];
            const yPos = screenCenterY + buttonOffsetY + (buttonSpacing * i);

            const slotText = slotData.exists
                ? `Save Slot ${slotData.id}` // Add timestamp or other info later
                : `Save Slot ${slotData.id} - Empty`;

            const slotLabel = this.add.text(screenCenterX - 50, yPos, slotText, slotData.exists ? buttonStyle : emptySlotStyle)
                .setOrigin(0.5);

            if (slotData.exists) {
                slotLabel.setInteractive({ useHandCursor: true });
                slotLabel.on('pointerover', () => slotLabel.setStyle(buttonHoverStyle));
                slotLabel.on('pointerout', () => slotLabel.setStyle(buttonStyle));
                slotLabel.on('pointerdown', () => {
                    console.log(`Load Slot ${slotData.id} clicked!`);
                    // Later: Load game state and start GameScene:
                    this.scene.start('GameScene', { loadSlot: slotData.id });
                });

                // Delete Button
                const deleteButton = this.add.text(screenCenterX + 150, yPos, 'Delete', deleteButtonStyle)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true });

                deleteButton.on('pointerover', () => deleteButton.setStyle(deleteButtonHoverStyle));
                deleteButton.on('pointerout', () => deleteButton.setStyle(deleteButtonStyle));
                deleteButton.on('pointerdown', () => {
                    console.log(`Delete Slot ${slotData.id} clicked!`);
                    // Later: Implement deletion logic (confirm first!)
                    // For now, just refresh the scene to potentially show it as empty
                    saveSlotsData[i].exists = false; // Simple demo update
                    this.scene.restart();
                });
            }
        }

        // --- Back Button ---
        const backButton = this.add.text(screenCenterX, screenCenterY + buttonOffsetY + (buttonSpacing * MAX_SAVE_SLOTS) + 20, 'Back', buttonStyle)
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
