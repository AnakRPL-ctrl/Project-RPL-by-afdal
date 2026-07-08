// Item system for the game
class Item {
    constructor(name, type, value, rarity = 'common') {
        this.name = name;
        this.type = type; // 'weapon', 'armor', 'potion', 'key'
        this.value = value;
        this.rarity = rarity; // 'common', 'rare', 'epic', 'legendary'
    }

    getRarityColor() {
        const colors = {
            'common': '#aaa',
            'rare': '#00d4ff',
            'epic': '#b300ff',
            'legendary': '#ffd700'
        };
        return colors[this.rarity] || '#aaa';
    }

    getDisplay() {
        return `${this.name} [${this.type}]`;
    }
}

// Predefined items
const ItemDatabase = {
    weapons: [
        new Item('Rusty Dagger', 'weapon', 5, 'common'),
        new Item('Iron Sword', 'weapon', 12, 'rare'),
        new Item('Steel Blade', 'weapon', 18, 'epic'),
        new Item('Enchanted Blade', 'weapon', 25, 'epic'),
        new Item('Legendary Excalibur', 'weapon', 35, 'legendary'),
        new Item('Battle Axe', 'weapon', 20, 'epic'),
        new Item('Magic Staff', 'weapon', 15, 'rare'),
    ],
    armor: [
        new Item('Leather Armor', 'armor', 3, 'common'),
        new Item('Iron Armor', 'armor', 8, 'rare'),
        new Item('Steel Plate', 'armor', 12, 'epic'),
        new Item('Mithril Plate', 'armor', 18, 'legendary'),
        new Item('Cursed Robes', 'armor', 5, 'rare'),
    ],
    potions: [
        new Item('Minor Health Potion', 'potion', 25, 'common'),
        new Item('Health Potion', 'potion', 50, 'rare'),
        new Item('Greater Health Potion', 'potion', 100, 'epic'),
        new Item('Elixir of Life', 'potion', 150, 'legendary'),
        new Item('Speed Potion', 'potion', 40, 'rare'),
    ],
    keys: [
        new Item('Silver Key', 'key', 0, 'rare'),
        new Item('Gold Key', 'key', 0, 'epic'),
        new Item('Ancient Key', 'key', 0, 'legendary'),
    ]
};

// Loot drop system
class LootDrop {
    constructor(x, y, item) {
        this.x = x;
        this.y = y;
        this.item = item;
        this.lifetime = 300; // 300 frames = 5 seconds at 60fps
        this.collected = false;
    }

    update() {
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.collected = true;
        }
    }

    draw(ctx) {
        if (this.collected) return;

        const rarityColor = this.item.getRarityColor();
        
        // Floating animation
        const float = Math.sin(Date.now() / 300) * 5;
        const drawY = this.y + float;

        // Glow effect
        ctx.fillStyle = rarityColor;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(this.x, drawY, 15, 0, Math.PI * 2);
        ctx.fill();

        // Item box
        ctx.globalAlpha = 1;
        ctx.fillStyle = rarityColor;
        ctx.fillRect(this.x - 8, drawY - 8, 16, 16);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 8, drawY - 8, 16, 16);

        // Rarity indicator
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✦', this.x, drawY + 3);
    }

    isNearby(px, py, distance = 30) {
        const dx = this.x - px;
        const dy = this.y - py;
        return Math.sqrt(dx * dx + dy * dy) < distance;
    }
}

// Generate random item drop
function generateRandomLoot(rarity = 'common') {
    const lootTable = {
        'common': [
            ItemDatabase.weapons[0],
            ItemDatabase.armor[0],
            ItemDatabase.potions[0],
        ],
        'rare': [
            ItemDatabase.weapons[1],
            ItemDatabase.armor[1],
            ItemDatabase.potions[1],
            ItemDatabase.keys[0],
        ],
        'epic': [
            ItemDatabase.weapons[2],
            ItemDatabase.armor[2],
            ItemDatabase.potions[2],
            ItemDatabase.keys[1],
        ],
        'legendary': [
            ItemDatabase.weapons[4],
            ItemDatabase.armor[3],
            ItemDatabase.potions[3],
            ItemDatabase.keys[2],
        ]
    };

    const pool = lootTable[rarity] || lootTable['common'];
    return pool[Math.floor(Math.random() * pool.length)];
}
