// Скрипт на создание Структуры для мода sculk horde при выполнении квестов
//работает,причем очень даж хорошо,проблем не наблюдал

console.log('Загрузка скрипта с сохранением состояния в файл...');

let SAVE_FILE = 'kubejs/data/quest_structure.json';

// Функция для загрузки данных
function loadData() {
    try {
        let data = JsonIO.read(SAVE_FILE);
        return data || { structure_created: false };
    } catch (e) {
        return { structure_created: false };
    }
}

// Функция для сохранения данных
function saveData(data) {
    JsonIO.write(SAVE_FILE, data);
}

// Загружаем данные при старте
let questData = loadData();

FTBQuestsEvents.completed('0F95F811EF9ACB52', event => {
    console.log('=== Квест 0F95F811EF9ACB52 выполнен ===');
    createStructureOnce(event.server);
});

FTBQuestsEvents.completed('712110262A61D38D', event => {
    console.log('=== Квест 712110262A61D38D выполнен ===');
    createStructureOnce(event.server);
});

function createStructureOnce(server) {
    // Проверяем, не создана ли уже структура(глупая проверка,если честно сам не ебу помогает или нет,по привычке делаю логирование)
    if (questData.structure_created) {
        console.log('⏭️ Структура уже была создана ранее - пропускаем');
        return;
    }
    
    console.log('🎉 Создаю структуру впервые...');
    
    // Фиксированные координаты
    let baseX = 0;
    let baseY = 100;
    let baseZ = 0;
    
    // активация орды
    server.runCommandSilent('sculkhorde gravemind state advance ');
    console.log('✅ Команда выполнена');

    // Создаем куб 3x3x3
    let blockCount = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                // Пропускаем центральный блок
                if (x === 0 && y === 0 && z === 0) continue;
                
                // Размещаем блоки для куба
                server.runCommandSilent(`/setblock ${baseX + x} ${baseY + y} ${baseZ + z} minecraft:obsidian replace`);
                blockCount++;
            }
        }
    }

    // Размещаем центральный блок
    server.runCommandSilent(`/setblock ${baseX} ${baseY} ${baseZ} sculkhorde:sculk_ancient_node`);
    
    // Помечаем, что структура создана и сохраняем в файл
    questData.structure_created = true;
    saveData(questData);
    
    console.log('🎊 Постоянная структура создана на координатах: ' + baseX + ', ' + baseY + ', ' + baseZ);
    console.log('📦 Размер: ' + blockCount + ' блоков камня + 1 алмазный блок');
    console.log('💾 Данные сохранены в файл - структура больше не создастся');
}

// Проверка при загрузке сервера
ServerEvents.loaded(event => {
    console.log('=== Сервер загружен ===');
    // Перезагружаем данные при загрузке сервера
    questData = loadData();
    if (questData.structure_created) {
        console.log('🏗️ Структура уже создана (проверка при загрузке)');
    } else {
        console.log('🆕 Структура еще не создана (проверка при загрузке)');
    }
});

console.log('✅ Скрипт с сохранением в файл загружен');