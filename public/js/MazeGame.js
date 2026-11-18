class MazeGame extends Phaser.Scene {
    constructor() 
    {
        super({ key: 'MazeGame' });
        this.mazeWidth = 15;
        this.mazeHeight = 11;
        this.cellSize = 32;
        this.currentLevel = 1;
        this.mazeLevels = [
            // Level 1 - Simple maze
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            // Level 2 - More complex paths
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            // Level 3 - Maze with dead ends
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            // Level 4 - Complex maze with multiple paths
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            // Level 5 - Most complex maze
            [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        ];
    }

    preload() 
    {
        const safeLoad = (key, path) => 
        {
            if (!this.textures.exists(key)) 
            {
                this.load.image(key, path);
            }
        };

        safeLoad('penguin_sprite', 'images/sprites/game_penguin.png');
        safeLoad('ice_background', 'images/ice_bg.jpg');
        safeLoad('fish', 'images/game_fish.png');
        safeLoad('icecube', 'images/icecube.png');
    }

    create(data) 
    {
        this.parentScene = data?.parentScene || null;

        const sky = this.add.image(0, 0, 'ice_background').setOrigin(0);
        sky.setScale(this.scale.width / sky.width, this.scale.height / sky.height);

        this.walls = this.physics.add.staticGroup();
        this.mazeLayout = this.mazeLevels[0];

        const offsetX = (800 - this.mazeWidth * this.cellSize) / 2;
        const offsetY = (600 - this.mazeHeight * this.cellSize) / 2;

        for (let y = 0; y < this.mazeHeight; y++) 
        {
            for (let x = 0; x < this.mazeWidth; x++) 
            {
                if (this.mazeLayout[y][x] === 1) 
                {
                    const wall = this.walls.create(offsetX + x * this.cellSize + this.cellSize / 2, offsetY + y * this.cellSize + this.cellSize / 2, 'icecube');
                    wall.setScale(0.08);
                    wall.setImmovable(true);
                    wall.body.moves = false;
                    wall.refreshBody();
                }
            }
        }

        this.player = this.physics.add.sprite(offsetX + this.cellSize * 1.5, offsetY + this.cellSize * 1.5, 'penguin_sprite');
        this.player.setScale(0.04).setCollideWorldBounds(true).setBounce(0);
        this.player.body.setSize(this.player.width * 0.4, this.player.height * 0.4);

        this.fish = this.physics.add.sprite(offsetX + (this.mazeWidth - 1.5) * this.cellSize, offsetY + (this.mazeHeight - 1.5) * this.cellSize, 'fish');
        this.fish.setScale(0.1);

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.fish, this.reachGoal, null, this);

        this.timeLeft = 20;
        this.timeText = this.add.text(16, 16, `Level ${this.currentLevel} - Time: ${this.timeLeft}`, { fontSize: '24px', color: '#000' });

        this.timer = this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });

        this.cursors = this.input.keyboard.createCursorKeys();

        // Mobile controls: allow several fingers at once, then build the D-pad
        this.touch = { left: false, right: false, up: false, down: false };
        this.input.addPointer(2);
        this.createTouchControls();

        this.add.text(400, 40, 'Guide the penguin through the maze\nto reach the fish!', { fontSize: '24px', color: '#000', align: 'center' }).setOrigin(0.5);
    }

    // Mobile controls

    createTouchControls() 
    {
        // The maze is 480px wide on an 800px canvas, leaving a 160px margin on
        // each side. The D-pad sits in the bottom-left corner, inside that margin.
        const cx = 82;
        const cy = 514;
        const gap = 54;

        this.makeButton(cx, cy - gap, '▲', 'up');
        this.makeButton(cx, cy + gap, '▼', 'down');
        this.makeButton(cx - gap, cy, '◀', 'left');
        this.makeButton(cx + gap, cy, '▶', 'right');
    }

    makeButton(x, y, label, key) 
    {
        const circle = this.add.circle(x, y, 26, 0x000000, 0.3)
            .setStrokeStyle(3, 0xffffff, 0.8)
            .setDepth(100)
            .setInteractive();

        this.add.text(x, y, label, { fontSize: '26px', color: '#ffffff' })
            .setOrigin(0.5)
            .setDepth(101);

        const press = () => { this.touch[key] = true; circle.setFillStyle(0x000000, 0.55); };
        const release = () => { this.touch[key] = false; circle.setFillStyle(0x000000, 0.3); };

        circle.on('pointerdown', press);
        circle.on('pointerover', (pointer) => { if (pointer.isDown) press(); }); // slide a finger onto a button
        circle.on('pointerup', release);
        circle.on('pointerout', release);
        circle.on('pointerupoutside', release);
    }

    // GAME LOGIC 

    updateTimer() 
    {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.timeText.setText(`Time: ${this.timeLeft}`);
            if (this.timeLeft === 0) {
                this.gameOver();
            }
        }
    }

    gameOver() 
    {
        this.physics.pause();
        this.timer.remove();

        const box = this.add.rectangle(400, 300, 500, 200, 0xffffff).setStrokeStyle(4, 0xff0000).setOrigin(0.5).setAlpha(0.9);
        const gameOverText = this.add.text(400, 280, '⏰ TIME\'S UP!\nTRY AGAIN!', { fontFamily: 'monospace', fontSize: '28px', color: '#ff0000', align: 'center' }).setOrigin(0.5);
        const backButton = this.add.text(400, 350, '↩ BACK TO MENU', { fontSize: '24px', fontFamily: 'monospace', color: '#ffffff', backgroundColor: '#ff0000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            document.getElementById('menu').style.display = 'block';
            document.getElementById('renderDiv').style.display = 'none';
            gameInstance.destroy(true);
        });
    }

    reachGoal() 
    {
        if (this.currentLevel === 5) {
            this.physics.pause();
            const box = this.add.rectangle(400, 300, 500, 200, 0xffffff).setStrokeStyle(4, 0x000000).setOrigin(0.5).setAlpha(0.9);
            const winText = this.add.text(400, 280, '🏆 YOU WON!\nALL LEVELS COMPLETE!', { fontFamily: 'monospace', fontSize: '26px', color: '#000000', align: 'center' }).setOrigin(0.5);
            const backButton = this.add.text(400, 350, '↩ BACK TO MENU', { fontSize: '24px', fontFamily: 'monospace', color: '#ffffff', backgroundColor: '#000', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive();

            backButton.on('pointerdown', () => {
                document.getElementById('menu').style.display = 'block';
                document.getElementById('renderDiv').style.display = 'none';
                gameInstance.destroy(true);
            });
        } else 
        {
            this.currentLevel++;
            this.physics.pause();
            const levelText = this.add.text(400, 300, `Level ${this.currentLevel}!`, { fontSize: '48px', color: '#000', align: 'center' }).setOrigin(0.5);
            this.time.delayedCall(2000, () => 
            {
                levelText.destroy();
                this.resetLevel();
            });
        }
    }

    resetLevel() 
    {
        this.timeLeft = 30;
        this.timeText.setText(`Level ${this.currentLevel} - Time: ${this.timeLeft}`);
        this.walls.clear(true, true);
        this.mazeLayout = this.mazeLevels[this.currentLevel - 1];

        const offsetX = (800 - this.mazeWidth * this.cellSize) / 2;
        const offsetY = (600 - this.mazeHeight * this.cellSize) / 2;

        for (let y = 0; y < this.mazeHeight; y++) 
        {
            for (let x = 0; x < this.mazeWidth; x++) 
            {
                if (this.mazeLayout[y][x] === 1) 
                {
                    const wall = this.walls.create(offsetX + x * this.cellSize + this.cellSize / 2, offsetY + y * this.cellSize + this.cellSize / 2, 'icecube');
                    wall.setScale(0.08);
                    wall.setImmovable(true);
                    wall.body.moves = false;
                    wall.refreshBody();
                }
            }
        }

        const startX = offsetX + this.cellSize * 1.5;
        const startY = offsetY + this.cellSize * 1.5;
        this.player.setPosition(startX, startY);
        this.player.setVelocity(0, 0);
        this.physics.resume();
    }

    update() 
    {
        const speed = 120;
        let velocityX = 0;
        let velocityY = 0;

        // Keyboard and on-screen buttons both drive the same movement
        const left = this.cursors.left.isDown || this.touch.left;
        const right = this.cursors.right.isDown || this.touch.right;
        const up = this.cursors.up.isDown || this.touch.up;
        const down = this.cursors.down.isDown || this.touch.down;

        if (left) 
        {
            velocityX = -speed;
            this.player.flipX = true;
        } else if (right) 
        {
            velocityX = speed;
            this.player.flipX = false;
        }
        if (up) 
        {
            velocityY = -speed;
        } else if (down) 
        {
            velocityY = speed;
        }
        this.player.setVelocityX(velocityX);
        this.player.setVelocityY(velocityY);
    }
}
