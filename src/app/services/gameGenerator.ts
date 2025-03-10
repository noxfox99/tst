// src/app/services/gamegenerator.ts
import Phaser from 'phaser';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export interface GameConfig {
  type: 'marioKart' | 'platformer' | 'custom';
  assets: {
    background?: string;  // Hinzugefügt für Hintergrund-Asset
    track?: string;
    player?: string;
    obstacles?: string[];
  };
  dimensions: {
    width: number;
    height: number;
  };
  rules?: Record<string, any>;
}

export class GameGenerator {
  private game: Phaser.Game | null = null;
  private socket: typeof Socket | null = null;
  private gameConfig: GameConfig;
  private container: HTMLElement;

  constructor(container: HTMLElement, config: GameConfig) {
    this.container = container;
    this.gameConfig = config;
  }

  initialize(): void {
    // Destroy any existing game instance
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }

    // Connect to multiplayer server if URL is provided
    const serverUrl = process.env.NEXT_PUBLIC_MULTIPLIER_SERVER_URL;
    if (serverUrl) {
      this.socket = io(serverUrl);
      this.setupSocketEvents();
    }

    // Define the Phaser game scene
    class GameScene extends Phaser.Scene {
      player?: Phaser.Physics.Arcade.Sprite;
      cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
      gameConfig: GameConfig;

      constructor(config: GameConfig) {
        super('GameScene');
        this.gameConfig = config;
      }

      preload() {
        // Load common assets - Unterstützung für dynamisch generierte Assets
        if (this.gameConfig.assets) {
          // Lade den Hintergrund, wenn vorhanden
          if (this.gameConfig.assets.background) {
            this.load.image('background', this.gameConfig.assets.background);
          } else {
            this.load.image('background', '/assets/background.png');
          }

          if (this.gameConfig.type === 'marioKart') {
            // Lade generierte oder Fallback-Assets für Mario Kart
            this.load.image('track', this.gameConfig.assets.track || '/assets/track.png');
            this.load.image('kart', this.gameConfig.assets.player || '/assets/kart.png');
            
            // Lade Hindernisse, falls vorhanden
            if (this.gameConfig.assets.obstacles && this.gameConfig.assets.obstacles.length > 0) {
              this.gameConfig.assets.obstacles.forEach((obstacle, index) => {
                this.load.image(`obstacle${index}`, obstacle);
              });
            } else {
              this.load.image('obstacle', '/assets/obstacle.png');
            }
          } else if (this.gameConfig.type === 'platformer') {
            // Lade Assets für Platformer
            this.load.image('player', this.gameConfig.assets.player || '/assets/player.png');
            this.load.image('platform', '/assets/platform.png');
            
            // Lade Hindernisse, falls vorhanden
            if (this.gameConfig.assets.obstacles && this.gameConfig.assets.obstacles.length > 0) {
              this.gameConfig.assets.obstacles.forEach((obstacle, index) => {
                this.load.image(`obstacle${index}`, obstacle);
              });
            } else {
              this.load.image('obstacle', '/assets/obstacle.png');
            }
          }
        } else {
          // Fallback, wenn keine Assets definiert sind
          this.load.image('background', '/assets/background.png');
          if (this.gameConfig.type === 'marioKart') {
            this.load.image('track', '/assets/track.png');
            this.load.image('kart', '/assets/kart.png');
            this.load.image('obstacle', '/assets/obstacle.png');
          } else if (this.gameConfig.type === 'platformer') {
            this.load.image('player', '/assets/player.png');
            this.load.image('platform', '/assets/platform.png');
            this.load.image('obstacle', '/assets/obstacle.png');
          }
        }
      }

      create() {
        // Add background
        this.add.image(0, 0, 'background')
          .setOrigin(0, 0)
          .setDisplaySize(this.gameConfig.dimensions.width, this.gameConfig.dimensions.height);

        // Set up game based on type
        if (this.gameConfig.type === 'marioKart') {
          this.createMarioKartGame();
        } else if (this.gameConfig.type === 'platformer') {
          this.createPlatformerGame();
        }
      }

      createMarioKartGame() {
        // Create track
        this.add.image(
          this.gameConfig.dimensions.width / 2,
          this.gameConfig.dimensions.height / 2,
          'track'
        );

        // Create player kart
        this.player = this.physics.add.sprite(100, 100, 'kart');
        if (this.player) {
          this.player.setCollideWorldBounds(true);
        }

        // Add obstacles
        const obstacles = this.physics.add.staticGroup();
        
        // Verwende dynamische Hindernisse wenn verfügbar, ansonsten Standard
        if (this.gameConfig.assets?.obstacles && this.gameConfig.assets.obstacles.length > 0) {
          for (let i = 0; i < 5; i++) {
            const obstacleIndex = i % this.gameConfig.assets.obstacles.length;
            obstacles.create(
              Phaser.Math.Between(100, this.gameConfig.dimensions.width - 100),
              Phaser.Math.Between(100, this.gameConfig.dimensions.height - 100),
              `obstacle${obstacleIndex}`
            );
          }
        } else {
          for (let i = 0; i < 5; i++) {
            obstacles.create(
              Phaser.Math.Between(100, this.gameConfig.dimensions.width - 100),
              Phaser.Math.Between(100, this.gameConfig.dimensions.height - 100),
              'obstacle'
            );
          }
        }

        // Add collision
        if (this.player) {
          this.physics.add.collider(this.player, obstacles);
        }

        // Set up controls
        if (this.input && this.input.keyboard) {
          this.cursors = this.input.keyboard.createCursorKeys();
        }
      }

      createPlatformerGame() {
        // Create platforms
        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'platform').setScale(2).refreshBody();
        platforms.create(600, 400, 'platform');
        platforms.create(50, 250, 'platform');

        // Create player
        this.player = this.physics.add.sprite(100, 450, 'player');
        if (this.player) {
          this.player.setBounce(0.2);
          this.player.setCollideWorldBounds(true);

          // Add collision
          this.physics.add.collider(this.player, platforms);
        }

        // Set up controls
        if (this.input && this.input.keyboard) {
          this.cursors = this.input.keyboard.createCursorKeys();
        }
      }

      update() {
        // Handle input and game logic
        if (!this.player || !this.cursors) return;

        if (this.gameConfig.type === 'marioKart') {
          // Kart movement
          if (this.cursors.left.isDown) {
            this.player.setVelocityX(-150);
          } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(150);
          } else {
            this.player.setVelocityX(0);
          }

          if (this.cursors.up.isDown) {
            this.player.setVelocityY(-150);
          } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(150);
          } else {
            this.player.setVelocityY(0);
          }
        } else if (this.gameConfig.type === 'platformer') {
          // Platform movement
          if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
          } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
          } else {
            this.player.setVelocityX(0);
          }

          if (this.cursors.up.isDown && this.player.body && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
          }
        }
      }
    }

    // Create the game config
    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: this.gameConfig.dimensions.width,
      height: this.gameConfig.dimensions.height,
      parent: this.container,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 200, x: 0 },
          debug: false
        }
      },
      scene: new GameScene(this.gameConfig)
    };

    // Create new game instance
    this.game = new Phaser.Game(phaserConfig);
  }

  private setupSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to multiplayer server');
    });

    this.socket.on('playerJoined', (data: any) => {
      console.log('Player joined:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
    });
  }

  cleanup(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}