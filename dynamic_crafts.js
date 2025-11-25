
// скрипт на выдачу рецептов при наличии указанной стадии

ServerEvents.recipes(function(event) {
    // библеотека
    var customRecipes = [
        // === IRON ===
        { output: 'minecraft:iron_helmet',     pattern: ['III','I I'],           ingredients: { I: 'minecraft:iron_ingot' }, stage: 'iron' },
        { output: 'minecraft:iron_chestplate', pattern: ['I I','III','III'],     ingredients: { I: 'minecraft:iron_ingot' }, stage: 'iron' },
        { output: 'minecraft:iron_leggings',   pattern: ['III','I I','I I'],     ingredients: { I: 'minecraft:iron_ingot' }, stage: 'iron' },
        { output: 'minecraft:iron_boots',      pattern: ['I I','I I'],           ingredients: { I: 'minecraft:iron_ingot' }, stage: 'iron' },
        { output: 'minecraft:iron_sword',      pattern: ['I','I','S'],           ingredients: { I: 'minecraft:iron_ingot', S: 'minecraft:stick' }, stage: 'iron' },
        { output: 'minecraft:iron_pickaxe',    pattern: ['III',' S ',' S '],     ingredients: { I: 'minecraft:iron_ingot', S: 'minecraft:stick' }, stage: 'iron' },
        { output: 'minecraft:iron_axe',        pattern: ['II ','IS ',' S '],     ingredients: { I: 'minecraft:iron_ingot', S: 'minecraft:stick' }, stage: 'iron' },
        { output: 'minecraft:iron_shovel',     pattern: ['I','S','S'],           ingredients: { I: 'minecraft:iron_ingot', S: 'minecraft:stick' }, stage: 'iron' },
        { output: 'minecraft:iron_hoe',        pattern: ['II ',' S ',' S '],     ingredients: { I: 'minecraft:iron_ingot', S: 'minecraft:stick' }, stage: 'iron' },

        // === DIAMOND ===
        { output: 'minecraft:diamond_helmet',     pattern: ['III','I I'],           ingredients: { I: 'minecraft:diamond' }, stage: 'diamond' },
        { output: 'minecraft:diamond_chestplate', pattern: ['I I','III','III'],     ingredients: { I: 'minecraft:diamond' }, stage: 'diamond' },
        { output: 'minecraft:diamond_leggings',   pattern: ['III','I I','I I'],     ingredients: { I: 'minecraft:diamond' }, stage: 'diamond' },
        { output: 'minecraft:diamond_boots',      pattern: ['I I','I I'],           ingredients: { I: 'minecraft:diamond' }, stage: 'diamond' },
        { output: 'minecraft:diamond_sword',      pattern: ['I','I','S'],           ingredients: { I: 'minecraft:diamond', S: 'minecraft:stick' }, stage: 'diamond' },
        { output: 'minecraft:diamond_pickaxe',    pattern: ['III',' S ',' S '],     ingredients: { I: 'minecraft:diamond', S: 'minecraft:stick' }, stage: 'diamond' },
        { output: 'minecraft:diamond_axe',        pattern: ['II ','IS ',' S '],     ingredients: { I: 'minecraft:diamond', S: 'minecraft:stick' }, stage: 'diamond' },
        { output: 'minecraft:diamond_shovel',     pattern: ['I','S','S'],           ingredients: { I: 'minecraft:diamond', S: 'minecraft:stick' }, stage: 'diamond' },
        { output: 'minecraft:diamond_hoe',        pattern: ['II ',' S ',' S '],     ingredients: { I: 'minecraft:diamond', S: 'minecraft:stick' }, stage: 'diamond' },

        // === FLINT ===
        { output: 'minecraft:flint_and_steel', pattern: [' I','S '], ingredients: { I: 'minecraft:iron_ingot', S: 'minecraft:flint' }, stage: 'flint' },

        // === SMELT ===
        { output: 'minecraft:blast_furnace',  pattern: ['SSS','SPS','LLL'], ingredients: {S: 'create:zinc_ingot', P: 'minecraft:furnace', L: 'minecraft:smooth_stone'}, stage: 'smelt'}
    ];

    console.log('[STAGES] Обработка ' + customRecipes.length + ' рецептов...');

    // главный скрипт
    for (var i = 0; i < customRecipes.length; i++) {
        (function() {
            var recipe = customRecipes[i];
            try {
                var resultItem = Item.of(recipe.output);
                if (resultItem.isEmpty()) {
                    console.warn('[STAGES] Пропущен несуществующий предмет: ' + recipe.output);
                    return;
                }

                // Удаляем крафт
                event.remove({ output: recipe.output });

                // Создаем объект для ключей рецепта
                var keyObj = {};
                var ingredients = recipe.ingredients;
                for (var key in ingredients) {
                    if (ingredients.hasOwnProperty(key)) {
                        keyObj[key] = Ingredient.of(ingredients[key]).toJson();
                    }
                }

                // Этот код должен был исправлять баг(если в сборке есть create то по хз какой причине появляется крафт в смешиватели(баг не исправлен))
                var recipeId = 'staged:' + recipe.output.replace(':', '_');
                // Исправляем возможные опечатки в ID
                recipeId = recipeId.replace('chesplate', 'chestplate'); // Исправляем опечатку

                // Создаём новый верстачный рецепт с уникальным ID
                var shaped = event.custom({
                    type: 'minecraft:crafting_shaped',
                    pattern: recipe.pattern,
                    key: keyObj,
                    result: resultItem.toJson()
                }).id(recipeId);

                // Добавляем стадию (через FTB XMod Compat / GameStages)
                if (typeof shaped.stage === 'function') {
                    shaped.stage(recipe.stage);
                } else if (typeof shaped.stages === 'function') {
                    shaped.stages([recipe.stage]);
                }

            } catch (err) {
                console.error('[STAGES ERROR] Ошибка при обработке рецепта ' + recipe.output + ': ' + err);
            }
        })();
    }
    
    // попытка правки ошибок
    customRecipes.forEach(function(recipe) {
        // Удаляем рецепты из Create для этих предметов
        event.remove({ output: recipe.output, mod: 'create' });
        // Также удаляем рецепты из других автоматических систем
        event.remove({ output: recipe.output, type: 'create:mixing' });
        event.remove({ output: recipe.output, type: 'create:compacting' });
        event.remove({ output: recipe.output, type: 'create:crushing' });
    });
});

// === Блокировка портала до стадии FLINT ===
BlockEvents.rightClicked(function(event) {
    var player = event.player;
    var block = event.block;
    var item = event.item;

    if (
        block.id === 'minecraft:obsidian' &&
        item.id === 'minecraft:flint_and_steel' &&
        !player.stages.has('flint')
    ) {
        player.tell(Text.red('§cПортал в Ад недоступен до стадии Flint!'));
        event.cancel();
    }
});