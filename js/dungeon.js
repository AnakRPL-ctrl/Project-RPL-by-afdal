// Dungeon generation and management
class Dungeon {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.obstacles = [];
        this.generateDungeon();
    }

    generateDungeon() {
        // Simple dungeon generation with obstacles
        const tileSize = 40;
        
        for (let y = 0; y < this.height; y += tileSize) {
            for (let x = 0; x < this.width; x += tileSize) {
                if (Math.random() < 0.15) {
                    this.obstacles.push({
                        x: x,
                        y: y,
                        width: tileSize,
                        height: tileSize
                    });
                }
            }
        }
    }

    isWalkable(x, y, width, height) {
        for (let obstacle of this.obstacles) {
            if (this.checkCollision(x, y, width, height, obstacle)) {
                return false;
            }
        }
        return true;
    }

    checkCollision(x1, y1, w1, h1, rect) {
        return x1 < rect.x + rect.width &&
               x1 + w1 > rect.x &&
               y1 < rect.y + rect.height &&
               y1 + h1 > rect.y;
    }

    draw(ctx) {
        // Draw background pattern
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Draw obstacles
        for (let obstacle of this.obstacles) {
            ctx.fillStyle = '#1a3a1a';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // Pattern
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            for (let x = obstacle.x; x < obstacle.x + obstacle.width; x += 10) {
                ctx.beginPath();
                ctx.moveTo(x, obstacle.y);
                ctx.lineTo(x, obstacle.y + obstacle.height);
                ctx.stroke();
            }
        }
    }
}

// Particle effect system
class Particle {
    constructor(x, y, vx, vy, color, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity
        this.lifetime--;
    }

    draw(ctx) {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        const size = 3 + (1 - alpha) * 2;
        ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
        ctx.globalAlpha = 1;
    }

    isAlive() {
        return this.lifetime > 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createExplosion(x, y, color = '#ff4444') {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 3 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, color, 30));
        }
    }

    createHitEffect(x, y, damage) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, '#ff8800', 25));
        }
    }

    createHealEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 1; // Float upward
            this.particles.push(new Particle(x, y, vx, vy, '#00ff00', 30));
        }
    }

    update() {
        this.particles = this.particles.filter(p => p.isAlive());
        this.particles.forEach(p => p.update());
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}
