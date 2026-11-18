class PlatformBee extends Phaser.Scene 
{
    constructor() 
    {
        super({ key: 'PlatformBee' });
    }

    preload() 
    {
        const safeLoad = (key, path) => {
            if (!this.textures.exists(key)) {
                this.load.image(key, path);
            }
        };

        safeLoad('cat_sprite', 'images/sprites/game_cat.png');
        safeLoad('background_sky', 'images/background_sky.jpg');
        safeLoad('yarn_ball', 'images/ball_yarn.png');
        safeLoad('cloud', 'images/cloud.png');
    }

    create(data) 
    {
        this.parentScene = data?.parentScene || null;

        // FIX 5: single source of truth for level time
        this.levelTime = 20;
        this.currentLevel = 1;
        this.timeRemaining = this.levelTime;

        //  state flags
        this.transitioning = false; // true during level-up pause
        this.ended = false;         // true after win / lose

        //  coyote time (grace window after leaving a platform)
        this.coyoteMs = 100;
        this.lastGrounded = -Infinity;

        // Touch button state
        this.touch = { left: false, right: false, jump: false };

        const sky = this.add.image(0, 0, 'background_sky').setOrigin(0);
        sky.setScale(this.scale.width / sky.width, this.scale.height / sky.height);

        this.levelText = this.add.text(400, 20, 'Level 1', { fontSize: '24px', color: '#000' }).setOrigin(0.5);
        this.timeText = this.add.text(20, 20, `Time: ${this.timeRemaining}`, { fontSize: '24px', color: '#000' });

        this.platforms = this.physics.add.staticGroup();

        //  no bounce, so the "on ground" check is stable
        this.cat = this.physics.add.sprite(50, 550, 'cat_sprite');
        this.cat.setScale(0.08).setCollideWorldBounds(true);
        this.cat.body.setGravityY(500);

        this.yarn = this.physics.add.image(750, 50, 'yarn_ball').setScale(0.2);

        this.createLevel(this.currentLevel);

        this.physics.add.collider(this.cat, this.platforms);
        this.physics.add.overlap(this.cat, this.yarn, this.collectYarn, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // Allow several fingers at once ( hold right + tap jump)
        this.input.addPointer(2);
        this.createTouchControls();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    // Mobile Controls

    createTouchControls() {
        const y = 540;
        this.controlObjects = [];
        this.controlObjects.push(...this.makeButton(60, y, '◀', 'left'));
        this.controlObjects.push(...this.makeButton(165, y, '▶', 'right'));
        this.controlObjects.push(...this.makeButton(740, y, '⤒', 'jump'));
    }

    makeButton(x, y, label, key) 
    {
        const circle = this.add.circle(x, y, 42, 0x000000, 0.3)
            .setStrokeStyle(3, 0xffffff, 0.8)
            .setDepth(100)
            .setInteractive();

        const text = this.add.text(x, y, label, { fontSize: '36px', color: '#ffffff' })
            .setOrigin(0.5)
            .setDepth(101);

        const press = () => { this.touch[key] = true; circle.setFillStyle(0x000000, 0.55); };
        const release = () => { this.touch[key] = false; circle.setFillStyle(0x000000, 0.3); };

        circle.on('pointerdown', press);
        circle.on('pointerover', (pointer) => { if (pointer.isDown) press(); }); // slide a finger onto a button
        circle.on('pointerup', release);
        circle.on('pointerout', release);
        circle.on('pointerupoutside', release);

        return [circle, text];
    }

    hideTouchControls() 
    {
        this.touch.left = this.touch.right = this.touch.jump = false;
        (this.controlObjects || []).forEach(o => o.setVisible(false));
        // disable input on the circles so they don't block the menu button
        (this.controlObjects || []).forEach(o => o.disableInteractive && o.disableInteractive());
    }

    // ---------- LEVELS ----------

    createLevel(level) {
        this.platforms.clear(true, true);
        const layouts = {
            1: [[150, 500], [350, 400], [550, 300], [750, 200], [250, 450], [450, 350]],
            2: [[150, 480], [300, 350], [450, 400], [600, 300], [750, 400]],
            3: [[150, 480], [200, 360], [480, 360], [600, 360], [750, 180]],
            4: [[150, 480], [300, 400], [500, 200], [700, 280], [750, 160]],
            5: [[100, 500], [150, 300], [475, 300], [600, 220], [600, 180], [600, 140], [750, 300]]
        };
        layouts[level].forEach(([x, y]) => {
            this.platforms.create(x, y, 'cloud').setScale(0.20).refreshBody();
        });
        const yarnPositions = {
            1: [750, 160],
            2: [750, 340],
            3: [750, 120],
            4: [750, 100],
            5: [750, 270]
        };
        this.yarn.setPosition(...yarnPositions[level]);
        this.cat.setPosition(50, 550);
        this.cat.setVelocity(0, 0);
        this.lastGrounded = -Infinity;
    }

    // Updated loop

    update() 
    {
        if (this.ended || this.transitioning) 
        {
            this.cat.setVelocityX(0);
            return;
        }

        const speed = 160;
        const goLeft = this.cursors.left.isDown || this.touch.left;
        const goRight = this.cursors.right.isDown || this.touch.right;
        const wantsJump = this.cursors.space.isDown || this.cursors.up.isDown || this.touch.jump;

        if (goLeft && !goRight) 
        {
            this.cat.setVelocityX(-speed);
        } else if (goRight && !goLeft) 
        {
            this.cat.setVelocityX(speed);
        } else 
        {
            this.cat.setVelocityX(0);
        }

        //  coyote time jump
        const onGround = this.cat.body.touching.down || this.cat.body.blocked.down;
        if (onGround) {
            this.lastGrounded = this.time.now;
        }

        if (wantsJump && this.time.now - this.lastGrounded <= this.coyoteMs) 
        {
            this.cat.setVelocityY(-450);
            // prevents a second jump inside the grace window
            this.lastGrounded = -Infinity; 
        }
    }

    updateTimer() 
    {
        this.timeRemaining--;
        this.timeText.setText(`Time: ${this.timeRemaining}`);
        if (this.timeRemaining <= 0) {
            this.timerEvent.remove();
            this.gameOver();
        }
    }

    // PROGRESSION

    collectYarn() 
    {
        // ignore repeat overlaps
        if (this.transitioning || this.ended) return;
        this.transitioning = true;

        if (this.currentLevel < 5) 
        {
            this.advanceLevel();
        } else 
        {
            this.completeGame();
        }
    }

    advanceLevel() 
    {
        this.currentLevel++;
        this.timeRemaining = this.levelTime;
        this.timeText.setText(`Time: ${this.timeRemaining}`);
        this.levelText.setText(`Level ${this.currentLevel}`);
        this.physics.pause();

        //stop the clock during the level-up pause
        this.timerEvent.paused = true;

        const levelUpText = this.add.text(400, 300, `Level ${this.currentLevel}!`, { fontSize: '64px', color: '#000' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => 
        {
            levelUpText.destroy();
            this.createLevel(this.currentLevel);
            this.physics.resume();
            this.timerEvent.paused = false;
            this.transitioning = false;
        });
    }

    //End Sscreen

    gameOver() 
    {
        if (this.ended) return;
        this.ended = true;
        this.physics.pause();
        this.hideTouchControls();

        const box = this.add.rectangle(400, 300, 500, 200, 0xffffff)
            .setStrokeStyle(4, 0xff0000)
            .setOrigin(0.5)
            .setAlpha(0.9)
            .setDepth(200);

        const gameOverText = this.add.text(400, 280, '⏰ TIME\'S UP!\nTRY AGAIN!', 
        {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5).setDepth(201);

        const backButton = this.add.text(400, 350, '↩ BACK TO MENU', 
        {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#ff0000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(201).setInteractive();

        backButton.on('pointerdown', () => 
        {
            document.getElementById('menu').style.display = 'block';
            document.getElementById('renderDiv').style.display = 'none';
            gameInstance.destroy(true);
        });
    }

    completeGame() 
    {
        if (this.ended) return;
        this.ended = true;
        this.physics.pause();

        // stop the timer so "TIME'S UP" can't appear over the win screen
        if (this.timerEvent) this.timerEvent.remove();
        this.hideTouchControls();

        const box = this.add.rectangle(400, 300, 500, 200, 0xffffff)
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5)
            .setAlpha(0.9)
            .setDepth(200);

        const winText = this.add.text(400, 280, '🏆 YOU WON!\nALL LEVELS COMPLETE!', 
        {
            fontFamily: 'monospace',
            fontSize: '26px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5).setDepth(201);

        const backButton = this.add.text(400, 350, '↩ BACK TO MENU', 
        {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(201).setInteractive();

        backButton.on('pointerdown', () => 
        {
            document.getElementById('menu').style.display = 'block';
            document.getElementById('renderDiv').style.display = 'none';
            gameInstance.destroy(true);
        });
    }
}
