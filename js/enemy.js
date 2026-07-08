// Enemy class with AI
class Enemy {
    constructor(x, y, level = 1, type = 'goblin') {
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 18;
        this.level = level;
        this.type = type;

        // Set stats based on type and level
        this.setStats();

        // Movement
        this.speed = 1.5;
        this.velocityX = 0;
        this.velocityY = 0;

        // AI
        this.state = 'patrol'; // patrol, chase, attack
        this.viewRange = 150;
        this.attackRange = 30;
        this.patrolTimer = 0;
        this.patrolDuration = Math.random() * 100 + 50;
        this.directionX = (Math.random() - 0.5) * 2;
        this.directionY = (Math.random() - 0.5) * 2;

        // Attack
        this.lastAttackTime = 0;
        this.attackCooldown = 60;
        this.isAttacking = false;

        // Health
        this.hp = this.maxHp;
        this.hpBarWidth = this.width + 10;
        this.hpBarHeight = 3;
    }

    setStats() {
        const typeStats = {
            'goblin': { hp: 20, attack: 5, defense: 1, expReward: 15, goldReward: 10, lootRarity: 'common' },
            'orc': { hp: 40, attack: 10, defense: 3, expReward: 30, goldReward: 25, lootRarity: 'rare' },
            'troll': { hp: 60, attack: 15, defense: 5, expReward: 50, goldReward: 50, lootRarity: 'rare' },
            'demon': { hp: 80, attack: 20, defense: 8, expReward: 100, goldReward: 100, lootRarity: 'epic' },
            'boss': { hp: 150, attack: 25, defense: 10, expReward: 200, goldReward: 200, lootRarity: 'legendary' }
        };

        const stats = typeStats[this.type] || typeStats['goblin'];
        this.maxHp = stats.hp * this.level;
        this.attack = stats.attack + (this.level - 1) * 2;
        this.defense = stats.defense + (this.level - 1);
        this.expReward = stats.expReward * this.level;
        this.goldReward = stats.goldReward * this.level;
        this.lootRarity = stats.lootRarity;
    }

    getColor() {
        const colors = {
            'goblin': '#44aa44',
            'orc': '#aa4444',
            'troll': '#884444',
            'demon': '#ff4444',
            'boss': '#ffff00'
        };
        return colors[this.type] || '#44aa44';
    }

    update(player, canvas, enemies) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // AI Logic
        if (distance < this.viewRange) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }

        if (distance < this.attackRange) {
            this.state = 'attack';
        }

        // Movement based on state
        if (this.state === 'patrol') {
            this.patrol(canvas);
        } else if (this.state === 'chase') {
            this.chase(player);
        } else if (this.state === 'attack') {
            this.targetPlayer(player);
        }

        // Apply velocity with collision avoidance
        const newX = this.x + this.velocityX;
        const newY = this.y + this.velocityY;

        // Check collision with other enemies
        let colliding = false;
        for (let enemy of enemies) {
            if (enemy === this) continue;
            const edx = newX - enemy.x;
            const edy = newY - enemy.y;
            const edist = Math.sqrt(edx * edx + edy * edy);
            if (edist < this.width + enemy.width) {
                colliding = true;
                break;
            }
        }

        if (!colliding) {
            this.x = Math.max(5, Math.min(canvas.width - this.width - 5, newX));
            this.y = Math.max(5, Math.min(canvas.height - this.height - 5, newY));
        }
    }

    patrol(canvas) {
        this.patrolTimer++;
        if (this.patrolTimer > this.patrolDuration) {
            this.patrolTimer = 0;
            this.patrolDuration = Math.random() * 100 + 50;
            this.directionX = (Math.random() - 0.5) * 2;
            this.directionY = (Math.random() - 0.5) * 2;
        }

        this.velocityX = this.directionX * this.speed * 0.5;
        this.velocityY = this.directionY * this.speed * 0.5;
    }

    chase(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.velocityX = (dx / distance) * this.speed;
            this.velocityY = (dy / distance) * this.speed;
        }
    }

    targetPlayer(player) {
        this.velocityX = 0;
        this.velocityY = 0;
    }

    attack(player) {
        if (Date.now() - this.lastAttackTime > this.attackCooldown * 16) {
            this.isAttacking = true;
            this.lastAttackTime = Date.now();
            
            const damage = Math.floor(this.attack + (Math.random() - 0.5) * this.attack * 0.3);
            return damage;
        }
        return 0;
    }

    takeDamage(damage) {
        this.hp -= damage;
        return this.hp <= 0;
    }

    draw(ctx) {
        const color = this.getColor();

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 4, this.y - 3, 3, 3);
        ctx.fillRect(this.x + 1, this.y - 3, 3, 3);

        // Boss indicator
        if (this.type === 'boss') {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // HP Bar
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(
            this.x - this.hpBarWidth / 2,
            this.y - this.height / 2 - 8,
            this.hpBarWidth,
            this.hpBarHeight
        );
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(
            this.x - this.hpBarWidth / 2,
            this.y - this.height / 2 - 8,
            this.hpBarWidth * hpPercent,
            this.hpBarHeight
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            this.x - this.hpBarWidth / 2,
            this.y - this.height / 2 - 8,
            this.hpBarWidth,
            this.hpBarHeight
        );
    }
}

// Enemy spawner
class EnemySpawner {
    constructor() {
        this.spawnCooldown = 0;
        this.spawnInterval = 120; // 120 frames = 2 seconds at 60fps
        this.maxEnemies = 10;
        this.waveNumber = 1;
        this.enemiesThisWave = 0;
        this.maxEnemiesPerWave = 5;
    }

    update(enemies, player, canvas) {
        if (this.spawnCooldown > 0) {
            this.spawnCooldown--;
        }

        // Check if wave is complete
        if (enemies.length === 0 && this.enemiesThisWave > 0) {
            this.waveNumber++;
            this.enemiesThisWave = 0;
            this.spawnCooldown = 180; // 3 second wait before next wave
        }

        if (this.spawnCooldown === 0 && enemies.length < this.maxEnemies && this.enemiesThisWave < this.maxEnemiesPerWave) {
            this.spawnEnemy(enemies, player, canvas);
            this.spawnCooldown = this.spawnInterval;
            this.enemiesThisWave++;
        }
    }

    spawnEnemy(enemies, player, canvas) {
        // Spawn far from player
        let x, y, distance;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
            distance = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        } while (distance < 150);

        // Determine enemy type based on wave
        let type = 'goblin';
        if (this.waveNumber > 3) type = 'orc';
        if (this.waveNumber > 6) type = 'troll';
        if (this.waveNumber > 10) type = 'demon';

        // Boss every 5 waves
        if (this.waveNumber % 5 === 0 && this.enemiesThisWave === 0) {
            type = 'boss';
        }

        const level = Math.floor(1 + this.waveNumber / 3);
        const enemy = new Enemy(x, y, level, type);
        enemies.push(enemy);
    }
}
