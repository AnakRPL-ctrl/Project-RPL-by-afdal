// UI management
class UI {
    constructor() {
        this.messages = [];
        this.maxMessages = 10;
        this.messageDuration = 300; // frames
    }

    addMessage(text, type = 'info') {
        const message = {
            text: text,
            type: type,
            lifetime: this.messageDuration
        };
        
        this.messages.unshift(message);
        
        if (this.messages.length > this.maxMessages) {
            this.messages.pop();
        }

        // Display in console as well
        console.log(`[${type.toUpperCase()}] ${text}`);
    }

    addCombatMessage(attacker, defender, damage, hit) {
        if (hit) {
            this.addMessage(`${attacker} hits ${defender} for ${damage} damage!`, 'combat');
        } else {
            this.addMessage(`${attacker} misses ${defender}!`, 'combat');
        }
    }

    addLootMessage(itemName, rarity) {
        this.addMessage(`Found: ${itemName}!`, 'loot');
    }

    addLevelUpMessage(level) {
        this.addMessage(`⭐ LEVEL UP! Now level ${level}!`, 'level-up');
    }

    update() {
        this.messages.forEach(msg => {
            msg.lifetime--;
        });
        this.messages = this.messages.filter(msg => msg.lifetime > 0);
    }

    updateStats(player) {
        document.getElementById('hp-display').textContent = `${Math.floor(player.hp)}/${player.maxHp}`;
        document.getElementById('atk-display').textContent = player.attack;
        document.getElementById('def-display').textContent = player.defense;
        document.getElementById('gold-display').textContent = player.gold;
        document.getElementById('level-display').textContent = player.level;
        document.getElementById('exp-display').textContent = `${player.exp}/${player.expToLevel}`;

        // Update inventory display
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = '';

        player.inventory.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `${item.name} <span>${item.type}</span>`;
            inventoryList.appendChild(div);
        });

        if (player.inventory.length === 0) {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = 'Empty';
            inventoryList.appendChild(div);
        }
    }

    updateMessages() {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';

        this.messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `message ${msg.type}`;
            div.textContent = msg.text;
            messagesContainer.appendChild(div);
        });
    }

    drawGameOver(ctx, canvas, player) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText(`Final Level: ${player.level}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText(`Final Gold: ${player.gold}`, canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText(`Total EXP: ${Math.floor(player.exp + (player.level - 1) * 100)}`, 
                     canvas.width / 2, canvas.height / 2 + 100);

        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.fillText('Refresh to play again', canvas.width / 2, canvas.height - 50);
    }

    drawWaveInfo(ctx, canvas, waveNumber) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(10, 10, 200, 60);
        
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('WAVE: ' + waveNumber, 20, 35);

        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        ctx.fillText('Wave gets harder...', 20, 55);
    }

    drawDebugInfo(ctx, player, enemies, fps) {
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${fps}`, 10, canvas.height - 10);
        ctx.fillText(`Enemies: ${enemies.length}`, 10, canvas.height - 25);
        ctx.fillText(`Player Pos: ${Math.round(player.x)}, ${Math.round(player.y)}`, 10, canvas.height - 40);
    }
}

// Crosshair indicator
class Crosshair {
    constructor(player) {
        this.player = player;
        this.x = player.x;
        this.y = player.y;
    }

    update(keys) {
        // Draw indicator based on facing direction
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.y = this.player.y - 30;
            this.x = this.player.x;
        } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.y = this.player.y + 30;
            this.x = this.player.x;
        } else if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x = this.player.x - 30;
            this.y = this.player.y;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x = this.player.x + 30;
            this.y = this.player.y;
        }
    }

    draw(ctx) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - 12, this.y);
        ctx.lineTo(this.x + 12, this.y);
        ctx.moveTo(this.x, this.y - 12);
        ctx.lineTo(this.x, this.y + 12);
        ctx.stroke();
    }
}
