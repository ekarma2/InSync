
class FlowerGame extends Phaser.Scene {
    constructor() {
        super({ key: 'FlowerGame' });
    }

    preload() {
        const safeLoad = (key, path) => 
        {
            if (!this.textures.exists(key)) {
                this.load.image(key, path);
            }
        };

        safeLoad('dog_sprite', 'images/sprites/game_dog.png');
        safeLoad('background_sky', 'images/background_sky.jpg');
        safeLoad('treat', 'images/dog_treat.png');
        safeLoad('cloud', 'images/cloud.png');
    }

    create(data) 
    {
        this.parentScene = data?.parentScene || null;
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.levelScoreThreshold = 100;
        this.treatSpeed = 200;
        this.gameOver = false;
        this.levelTransition = false;

        const sky = this.add.image(0, 0, 'background_sky').setOrigin(0);
        sky.setScale(this.scale.width / sky.width, this.scale.height / sky.height);

        this.levelText = this.add.text(400, 20, 'Level 1', 
        {
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);

        this.add.text(400, 100, 'Catch the falling treats!\nMove the dog with your mouse.\nYou have 30 seconds!\nReach 100 points to advance to next level!', {
            fontSize: '24px',
            color: '#000',
            align: 'center'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(20, 20, 'Score: 0', 
        {
            fontSize: '24px',
            color: '#000'
        });

        this.livesText = this.add.text(620, 20, '❤️'.repeat(this.lives), 
        {
            fontSize: '24px',
            color: '#000'
        });

        // Initialize 30-second timer
        this.timeLeft = 30;

        this.timerText = this.add.text(343, 30, `Time: ${this.timeLeft}`, 
        {
            fontSize: '24px',
            color: '#000'
        });

        this.timerEvent = null;

        // Create dog
        this.dog = this.physics.add.image(400, 500, 'dog_sprite');
        this.dog.setScale(0.08);
        this.dog.setCollideWorldBounds(true);

        // Create treat group
        this.treats = this.physics.add.group();

        // Single collision handler for all treats
        this.physics.add.overlap(
            this.dog,
            this.treats,
            this.collectTreat,
            null,
            this
        );

        // Treat spawning starts after countdown
        this.treatSpawnEvent = null;

        // Move dog with mouse
        this.input.on('pointermove', pointer => 
        {
            this.dog.x = Phaser.Math.Clamp(pointer.x, 50, 750);
        });

        // Initial countdown
        this.countdownText = this.add.text(400, 300, '3', 
        {
            fontSize: '40px',
            color: '#000'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: this.updateCountdown,
            callbackScope: this
        });
    }

    // Initial 3-2-1 countdown
    updateCountdown() 
    {
        let num = parseInt(this.countdownText.text);

        if (num > 1) {
            this.countdownText.setText(num - 1);
        } else {
            this.countdownText.setText('GO!');

            this.time.delayedCall(500, () => {
                if (this.gameOver) return;

                this.countdownText.destroy();

                // Start spawning treats
                this.treatSpawnEvent = this.time.addEvent({
                    delay: 1500,
                    callback: this.spawnTreat,
                    callbackScope: this,
                    loop: true
                });

                // Start timer
                this.startTimer();
            });
        }
    }

    // Start the timer
    startTimer() 
    {
        if (this.timerEvent) 
        {
            this.timerEvent.remove();
        }

        this.timerEvent = this.time.addEvent(
        {
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    // Update timer every second
    updateTimer() 
    {
        if (this.gameOver || this.levelTransition) return;

        this.timeLeft--;
        this.timerText.setText(`Time: ${this.timeLeft}`);

        if (this.timeLeft <= 0) 
        {
            this.endGame();
        }
    }

    // Spawn falling treats
    spawnTreat() 
    {
        if (this.gameOver || this.levelTransition) return;

        const x = Phaser.Math.Between(50, 750);
        const treat = this.treats.create(x, 0, 'treat').setScale(0.12);

        treat.setVelocityY(200);
        treat.setVelocityY(this.treatSpeed);
    }

    // Collect treats
    collectTreat(dog, treat) 
    {
        if (this.gameOver || this.levelTransition) return;

        treat.destroy();

        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        if (
            this.score >= this.levelScoreThreshold * this.currentLevel &&
            this.currentLevel < 5
        ) {
            this.advanceLevel();
        } else if (
            this.currentLevel === 5 &&
            this.score >= this.levelScoreThreshold * 5
        ) {
            this.endGame(true);
        }
    }

    // Advance to next level
    advanceLevel() 
    {
        if (this.gameOver || this.levelTransition) return;

        this.currentLevel++;
        this.levelTransition = true;

        // Pause physics
        this.physics.pause();

        // Reset timer to 30 seconds
        this.timeLeft = 30;
        this.timerText.setText(`Time: ${this.timeLeft}`);

        const levelUpText = this.add.text(
            400,
            300,
            `Level ${this.currentLevel}!`,
            {
                fontSize: '64px',
                color: '#000'
            }
        ).setOrigin(0.5);

        this.levelText.setText(`Level ${this.currentLevel}`);

        // Wait two seconds before continuing
        this.time.delayedCall(2000, () => {
            if (this.gameOver) return;

            levelUpText.destroy();

            this.levelTransition = false;

            // Resume game
            this.physics.resume();
        });
    }

    // Lose a life
    loseLife() 
    {
        if (this.gameOver || this.levelTransition) return;

        this.lives--;
        this.livesText.setText('❤️'.repeat(this.lives));

        if (this.lives <= 0) {
            this.endGame(false);
        } else {
            const warning = this.add.text(
                400,
                300,
                `Life Lost! ${this.lives} lives remaining!`,
                {
                    fontSize: '32px',
                    color: '#ff0000',
                    align: 'center'
                }
            ).setOrigin(0.5);

            this.time.delayedCall(1000, () => warning.destroy());
        }
    }

    // End game
    endGame(completed = false) 
    {
        if (this.gameOver) return;

        this.gameOver = true;
        this.physics.pause();

        // Stop timer
        if (this.timerEvent) 
        {
            this.timerEvent.remove();
            this.timerEvent = null;
        }

        // Stop treat spawning
        if (this.treatSpawnEvent) 
        {
            this.treatSpawnEvent.remove();
            this.treatSpawnEvent = null;
        }

        // Remove remaining treats
        this.treats.clear(true, true);

        let msg = completed
            ? `Congratulations!\nYou completed all levels!\nFinal Score: ${this.score}`
            : `Final Score: ${this.score}\nReached Level ${this.currentLevel}`;

        if (this.lives <= 0) 
        {
            msg = `Game Over!\nNo lives remaining\n${msg}`;
        }

        if (this.timeLeft <= 0 && !completed) 
        {
            msg = `Time's Up!\n${msg}`;
        }

        this.add.text(400, 300, msg, 
        {
            fontSize: '48px',
            color: '#000',
            align: 'center'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => 
        {
            window.location.href = '/games';
        });
    }

    // Check for missed treats
    update() 
    {
        if (this.gameOver || this.levelTransition) return;

        this.treats.getChildren().forEach(treat => 
        {
            if (treat.y > 600) 
            {
                treat.destroy();
                this.loseLife();
            }
        });
    }
}
