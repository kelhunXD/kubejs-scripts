// для работы нужен аддон lootJS
// библиотека руд и их кирок
const AdvancedOreLoot = {
    // Настройки для всех руд
    ores: {
        'iron_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'spelunkery:raw_iron_nugget',
                minCount: 3,
                maxCount: 8
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe'],
                loot: 'minecraft:raw_iron',
                count: 1
            }
        },
        
        'emerald_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'spelunkery:rough_emerald_shard',
                minCount: 2,
                maxCount: 5
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe'],
                loot: 'spelunkery:rough_emerald',
                count: 1
            }
        },
        
        'lapis_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'spelunkery:rough_lazurite',
                minCount: 3,
                maxCount: 7
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe'],
                loot: 'minecraft:lapis_lazuli',
                count: [4, 9]
            }
        },
        
        'redstone_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'spelunkery:rough_cinnabar_shard',
                minCount: 2,
                maxCount: 5
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe'],
                loot: 'spelunkery:rough_cinnabar',
                count: [4, 5]
            }
        },
        
        'coal_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe'],
                loot: 'spelunkery:coal_lump',
                minCount: 2,
                maxCount: 4
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe', 'iceandfire:silver_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe'],
                loot: 'minecraft:coal',
                count: 1
            }
        },
        
        'copper_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'minecraft:golden_pickaxe'],
                loot: 'spelunkery:raw_copper_nugget',
                minCount: 3,
                maxCount: 8
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe', 'iceandfire:silver_pickaxe', 'minecraft:iron_pickaxe'],
                loot: 'minecraft:raw_copper',
                count: 1
            }
        },
        
        'gold_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'spelunkery:raw_gold_nugget',
                minCount: 3,
                maxCount: 7
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe'],
                loot: 'minecraft:raw_gold',
                count: 1
            }
        },
        
        'diamond_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe', 'minecraft:diamond_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'spelunkery:rough_diamond_shard',
                minCount: 2,
                maxCount: 4
            },
            highTier: {
                tools: ['minecraft:netherite_pickaxe'],
                loot: 'spelunkery:rough_diamond',
                count: 1
            }
        },

        'lead_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe'],
                loot: 'spelunkery:raw_lead_nugget',
                minCount: 3,
                maxCount: 6
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'oreganized:raw_lead',
                count: 1
            }
        },
        
        'silver_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe', 'iceandfire:silver_pickaxe'],
                loot: 'spelunkery:raw_silver_nugget',
                minCount: 3,
                maxCount: 6
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe', 'minecraft:iron_pickaxe', 'minecraft:golden_pickaxe'],
                loot: 'oreganized:raw_silver',
                count: 1
            }
        },
        
        'zinc_ore': {
            lowTier: {
                tools: ['minecraft:wooden_pickaxe', 'minecraft:stone_pickaxe'],
                loot: 'spelunkery:raw_zinc_nugget',
                minCount: 3,
                maxCount: 6
            },
            highTier: {
                tools: ['minecraft:diamond_pickaxe', 'minecraft:netherite_pickaxe', 'minecraft:golden_pickaxe', 'iceandfire:silver_pickaxe', 'minecraft:iron_pickaxe'],
                loot: 'create:raw_zinc',
                count: 1
            }
        }
    }
};

// рандомайзер
function getRandomCount(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// для каждой руды - свой оброботчик(добавляйте о аналогии)
function registerOreHandlers() {
    const oreConfigs = AdvancedOreLoot.ores;
    
    // Железная руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['iron_ore'];
        event.addBlockLootModifier(/iron_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/iron_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Изумрудная руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['emerald_ore'];
        event.addBlockLootModifier(/emerald_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/emerald_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Лазуритовая руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['lapis_ore'];
        event.addBlockLootModifier(/lapis_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/lapis_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Редстоуновая руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['redstone_ore'];
        event.addBlockLootModifier(/redstone_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/redstone_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Угольная руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['coal_ore'];
        event.addBlockLootModifier(/coal_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/coal_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Медная руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['copper_ore'];
        event.addBlockLootModifier(/copper_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/copper_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Золотая руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['gold_ore'];
        event.addBlockLootModifier(/gold_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/gold_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Алмазная руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['diamond_ore'];
        event.addBlockLootModifier(/diamond_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/diamond_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Свинцовая руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['lead_ore'];
        event.addBlockLootModifier(/lead_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/lead_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Серебряная руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['silver_ore'];
        event.addBlockLootModifier(/silver_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/silver_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Цинковая руда
    LootJS.modifiers(event => {
        const cfg = oreConfigs['zinc_ore'];
        event.addBlockLootModifier(/zinc_ore/)
            .matchMainHand(cfg.lowTier.tools)
            .removeLoot('*')
            .apply(context => {
                const count = getRandomCount(cfg.lowTier.minCount, cfg.lowTier.maxCount);
                context.addLoot(Item.of(cfg.lowTier.loot, count));
            });
            
        event.addBlockLootModifier(/zinc_ore/)
            .matchMainHand(cfg.highTier.tools)
            .removeLoot('*')
            .addLoot(cfg.highTier.loot, cfg.highTier.count);
    });

    // Глубокие сланцевые руды
    LootJS.modifiers(event => {
        const deepslateOres = [
            'deepslate_iron_ore', 'deepslate_copper_ore', 'deepslate_gold_ore',
            'deepslate_emerald_ore', 'deepslate_lapis_ore', 'deepslate_redstone_ore',
            'deepslate_diamond_ore', 'deepslate_coal_ore'
        ];
        
        for (var i = 0; i < deepslateOres.length; i++) {
            var ore = deepslateOres[i];
            var baseOre = ore.replace('deepslate_', '');
            var oreCfg = oreConfigs[baseOre];
            
            if (oreCfg) {
                // Низкоуровневые кирки
                event.addBlockLootModifier(new RegExp(ore))
                    .matchMainHand(oreCfg.lowTier.tools)
                    .removeLoot('*')
                    .apply(context => {
                        var cnt = getRandomCount(oreCfg.lowTier.minCount, oreCfg.lowTier.maxCount);
                        context.addLoot(Item.of(oreCfg.lowTier.loot, cnt));
                    });
                    
                // Высокоуровневые кирки
                event.addBlockLootModifier(new RegExp(ore))
                    .matchMainHand(oreCfg.highTier.tools)
                    .removeLoot('*')
                    .addLoot(oreCfg.highTier.loot, oreCfg.highTier.count);
            }
        }
    });
}

// Инициализируем все обработчики
registerOreHandlers();
