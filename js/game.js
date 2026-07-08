// Main game loop
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Initialize game objects
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.dungeon = new Dungeon(this.canvas.width, this.canvas.height);
        this.enemies = [];
        this.loot = [];
        this.spawner = new EnemySpawner();
        this.ui = new UI();
        this.particles = new ParticleSystem();
        this.crosshair = new Crosshair(this.player);

        // Game state
        this.running = true;
        this.gameOver = false;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsCounter = 0;

        // Input
        this.keys = {};
        this.setupInputListeners();

        // Start first message
        this.ui.addMessage('Welcome to Dungeon Crawler!', 'info');
        this.ui.addMessage('Defeat enemies, collect loot, and survive!', 'info');
        this.ui.addMessage('Wave 1 starting...', 'level-up');
    }

    setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Special keys
            if (e.key === ' ') {
                e.preventDefault();
                if (this.player.attack()) {
                    this.handlePlayerAttack();
                }
            }
            if (e.key === 'e' || e.key === 'E') {
                this.collectNearbyLoot();
            }
            if (e.key === 'r' || e.key === 'R') {
                const potion = this.player.usePotion();
                if (potion) {
                    this.ui.addMessage(`Used ${potion.name}!`, 'info');
                    this.particles.createHealEffect(this.player.x, this.player.y);
                } else {
                    this.ui.addMessage('No potions available!', 'info');
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    handlePlayerAttack() {
        const attackDamage = this.player.getAttackDamage();
        const attackRange = 40;

        let hitCount = 0;
        for (let enemy of this.enemies) {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < attackRange) {
                const isDead = enemy.takeDamage(attackDamage);
                this.ui.addCombatMessage('Player', enemy.type, attackDamage, true);
                this.particles.createHitEffect(enemy.x, enemy.y, attackDamage);
                hitCount++;

                if (isDead) {
                    this.enemyDefeated(enemy);
                }
            }
        }

        if (hitCount === 0) {
            this.ui.addMessage('No enemies in range!', 'info');
        }
    }

    enemyDefeated(enemy) {
        // Remove enemy from array
        this.enemies = this.enemies.filter(e => e !== enemy);

        // Reward player
        this.player.gainExp(enemy.expReward);
        this.player.gainGold(enemy.goldReward);

        // Create loot
        const loot = new LootDrop(enemy.x, enemy.y, generateRandomLoot(enemy.lootRarity));
        this.loot.push(loot);

        // Effects
        this.particles.createExplosion(enemy.x, enemy.y, '#ffaa00');
        this.ui.addMessage(`Defeated ${enemy.type}! +${enemy.expReward}EXP +${enemy.goldReward}Gold`, 'loot');

        // Check level up
        if (this.player.level > this.player.level) {
            this.ui.addLevelUpMessage(this.player.level);
        }
    }

    collectNearbyLoot() {
        for (let i = this.loot.length - 1; i >= 0; i--) {
            const drop = this.loot[i];
            if (drop.isNearby(this.player.x, this.player.y, 40)) {
                if (this.player.addItem(drop.item)) {
                    this.ui.addMessage(`Collected ${drop.item.name}!`, 'loot');
                    this.particles.createHealEffect(drop.x, drop.y);
                    this.loot.splice(i, 1);
                } else {
                    this.ui.addMessage('Inventory full!', 'info');
                }
            }
        }
    }

    update() {
        if (this.gameOver) return;

        // Update player
        this.player.update(this.keys, this.canvas);
        this.crosshair.update(this.keys);

        // Spawn enemies
        this.spawner.update(this.enemies, this.player, this.canvas);

        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(this.player, this.canvas, this.enemies);

            // Enemy attack
            const distance = Math.sqrt(
                (this.player.x - enemy.x) ** 2 +
                (this.player.y - enemy.y) ** 2
            );

            if (distance < enemy.attackRange) {
                const damage = enemy.attack(this.player);
                if (damage > 0) {
                    const actualDamage = this.player.takeDamage(damage);
                    this.ui.addCombatMessage(enemy.type, 'Player', actualDamage, true);
                    this.particles.createHitEffect(this.player.x, this.player.y, actualDamage);
                }
            }
        }

        // Update loot
        this.loot.forEach(drop => drop.update());
        this.loot = this.loot.filter(drop => !drop.collected);

        // Update particles
        this.particles.update();

        // Update UI
        this.ui.update();
        this.ui.updateStats(this.player);

        // Check game over
        if (this.player.hp <= 0) {
            this.gameOver = true;
            this.ui.addMessage('You have been defeated...', 'combat');
        }

        this.frameCount++;
    }

    draw() {
        // Clear canvas
        this.dungeon.draw(this.ctx);

        // Draw game objects
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.loot.forEach(drop => drop.draw(this.ctx));
        this.particles.draw(this.ctx);
        this.player.draw(this.ctx);
        this.crosshair.draw(this.ctx);

        // Draw wave info
        this.ui.drawWaveInfo(this.ctx, this.canvas, this.spawner.waveNumber);

        // Draw game over screen
        if (this.gameOver) {
            this.ui.drawGameOver(this.ctx, this.canvas, this.player);
        }

        // Update message display
        this.ui.updateMessages();
    }

    run() {
        const gameLoop = () => {
            this.update();
            this.draw();
            
            // FPS counter
            this.fpsCounter++;
            if (Date.now() % 1000 < 16) {
                this.fps = this.fpsCounter;
                this.fpsCounter = 0;
            }

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// Initialize and start game
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    game.run();
    
    console.log('%c=== DUNGEON CRAWLER ===', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    console.log('%cGame initialized. Have fun!', 'color: #00d4ff; font-size: 14px;');
    console.log('%cControls: Arrow keys/WASD to move, SPACE to attack, E to collect loot, R for potion', 'color: #ffff00;');
});
