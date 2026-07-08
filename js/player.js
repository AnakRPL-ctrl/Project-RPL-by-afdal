// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 3;
        
        // Stats
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.attack = 10;
        this.defense = 5;
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 100;
        this.gold = 0;

        // Inventory
        this.inventory = [];
        this.maxInventory = 10;
        this.equippedWeapon = null;
        this.equippedArmor = null;

        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Attack
        this.lastAttackTime = 0;
        this.attackCooldown = 30; // frames
        this.isAttacking = false;
        this.attackDuration = 10;

        // Status effects
        this.invulnerableTime = 0;
        this.speedBoostTime = 0;
    }

    addItem(item) {
        if (this.inventory.length < this.maxInventory) {
            this.inventory.push(item);
            return true;
        }
        return false;
    }

    equip(index) {
        if (index >= 0 && index < this.inventory.length) {
            const item = this.inventory[index];
            if (item.type === 'weapon') {
                this.equippedWeapon = item;
                this.attack = 10 + item.value;
                return true;
            } else if (item.type === 'armor') {
                this.equippedArmor = item;
                this.defense = 5 + item.value;
                return true;
            }
        }
        return false;
    }

    usePotion() {
        for (let i = 0; i < this.inventory.length; i++) {
            const item = this.inventory[i];
            if (item.type === 'potion') {
                this.hp = Math.min(this.maxHp, this.hp + item.value);
                this.inventory.splice(i, 1);
                return item;
            }
        }
        return null;
    }

    takeDamage(damage) {
        if (this.invulnerableTime > 0) return 0;

        const actualDamage = Math.max(1, damage - this.defense);
        this.hp -= actualDamage;
        this.invulnerableTime = 20; // 20 frames of invulnerability
        return actualDamage;
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.expToLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp = 0;
        this.expToLevel = Math.floor(100 * Math.pow(1.2, this.level - 1));
        
        // Increase base stats
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.attack += 3;
        this.defense += 2;

        return this.level;
    }

    gainGold(amount) {
        this.gold += amount;
    }

    update(keys, canvas) {
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;

        const moveSpeed = this.speedBoostTime > 0 ? this.speed * 1.5 : this.speed;

        if (keys['ArrowUp'] || keys['w'] || keys['W']) this.velocityY = -moveSpeed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) this.velocityY = moveSpeed;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.velocityX = -moveSpeed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) this.velocityX = moveSpeed;

        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Boundary checking
        this.x = Math.max(5, Math.min(canvas.width - this.width - 5, this.x));
        this.y = Math.max(5, Math.min(canvas.height - this.height - 5, this.y));

        // Update status effects
        this.invulnerableTime--;
        if (this.speedBoostTime > 0) {
            this.speedBoostTime--;
        }

        // Attack cooldown
        if (this.isAttacking) {
            this.attackDuration--;
            if (this.attackDuration <= 0) {
                this.isAttacking = false;
            }
        }
    }

    attack() {
        if (Date.now() - this.lastAttackTime > this.attackCooldown * 16) {
            this.isAttacking = true;
            this.attackDuration = 10;
            this.lastAttackTime = Date.now();
            return true;
        }
        return false;
    }

    getAttackDamage() {
        const baseAttack = this.attack;
        const variance = Math.random() * 0.3 - 0.15; // ±15%
        return Math.floor(baseAttack * (1 + variance));
    }

    draw(ctx) {
        // Invulnerability flash
        if (this.invulnerableTime > 0 && this.invulnerableTime % 8 < 4) {
            ctx.globalAlpha = 0.5;
        }

        // Player body
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // Attack indicator
        if (this.isAttacking) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Glow effect for level
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect(this.x - this.width / 2 - 2, this.y - this.height / 2 - 2, 
                       this.width + 4, this.height + 4);

        ctx.globalAlpha = 1;
    }

    getStats() {
        return {
            hp: this.hp,
            maxHp: this.maxHp,
            attack: this.attack,
            defense: this.defense,
            level: this.level,
            exp: this.exp,
            expToLevel: this.expToLevel,
            gold: this.gold,
            inventory: this.inventory.length
        };
    }
}
