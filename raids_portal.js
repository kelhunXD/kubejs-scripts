
// Система рейдов через мод gateways to entity
// скрипт относительно работает шикарно,но проблемы все равно есть,в аду спавнится не могут,но оптимизация к слову хороша(потому что нет е###### босс бара)
let MIN_RAID_INTERVAL = 5 * 24000 // минимальный интервал
let MAX_RAID_INTERVAL = 7 * 24000 // максимальный интервал
let SPAWN_DISTANCE = 30 // расстояние от игрока для спавна
let RAID_WARNING_TIME = 1 * 24000 // Предупреждение за 1 игровой день до рейда

console.log("Custom Raids Portal System v9.0.0 loaded!")

// Система порталов
let gateways = [
    { path: "leviathan_tier10_v16", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier10_v20", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier10_v21", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier10_v17", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier10_v18", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier10_v19", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier5_v24", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier5_v23", boss: "cataclysm:the_leviathan" },
    { path: "leviathan_tier5_v22", boss: "cataclysm:the_leviathan" },
    
    // Maledictus порталы
    { path: "maledictus_tier5_v31", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier5_v30", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier5_v32", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier7_v33", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier10_v26", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier10_v28", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier10_v25", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier10_v27", boss: "cataclysm:maledictus" },
    { path: "maledictus_tier15_v29", boss: "cataclysm:maledictus" },
    
    // Ancient Remnant порталы
    { path: "ancient_revenant_tier5_v4", boss: "cataclysm:ancient_remnant" },
    { path: "ancient_revenant_tier5_v5", boss: "cataclysm:ancient_remnant" },
    { path: "ancient_revenant_tier10_v6", boss: "cataclysm:ancient_remnant" },
    { path: "ancient_revenant_tier10_v7", boss: "cataclysm:ancient_remnant" },
    { path: "ancient_revenant_tier14_v1", boss: "cataclysm:ancient_remnant" },
    { path: "ancient_revenant_tier14_v2", boss: "cataclysm:ancient_remnant" },
    { path: "ancient_revenant_tier5_v3", boss: "cataclysm:ancient_remnant" },
    
    // Ignis порталы
    { path: "ignis_tier15_v14", boss: "cataclysm:ignis" },
    { path: "ignis_tier10_v13", boss: "cataclysm:ignis" },
    { path: "ignis_tier5_v15", boss: "cataclysm:ignis" },
    
    // Hurbringer порталы(я знаю что название не верное!!! не говори так)
    { path: "hurbringer_tier5_v12", boss: "cataclysm:the_harbinger" },
    { path: "hurbringer_tier5_v11", boss: "cataclysm:the_harbinger" },
    { path: "hurbringer_tier10_v8", boss: "cataclysm:the_harbinger" },
    { path: "hurbringer_tier10_v9", boss: "cataclysm:the_harbinger" },
    { path: "hurbringer_tier15_v10", boss: "cataclysm:the_harbinger" }
]

//  система боссов
let bossControlSystem = {
  bosses: [
    {
      id: 'cataclysm:ancient_remnant',
      name: 'Древнейший Ревенант',
      defeated: false
    },
    {
      id: 'cataclysm:maledictus',
      name: 'Маледиктус',
      defeated: false
    },
    {
      id: 'cataclysm:ignis',
      name: 'Игнис',
      defeated: false
    },
    {
      id: 'cataclysm:the_leviathan',
      name: 'Левиафан',
      defeated: false
    },
    {
      id: 'cataclysm:the_harbinger',
      name: 'Смотритель',
      defeated: false
    }
  ],
  
  initialize: function(server) {
    this.bosses.forEach(boss => {
      let bossKey = `boss_${this.formatId(boss.id)}_defeated`
      if (server.persistentData.contains(bossKey)) {
        boss.defeated = server.persistentData.getBoolean(bossKey)
      } else {
        server.persistentData.putBoolean(bossKey, false)
        boss.defeated = false
      }
      console.log(`Босс ${boss.name}: ${boss.defeated ? 'ПОБЕЖДЕН' : 'АКТИВЕН'}`)
    })
  },
  
  formatId: function(entityId) {
    return entityId.replace(/:/g, '_')
  },
  
  markBossDefeated: function(server, bossId) {
    let boss = this.bosses.find(b => b.id === bossId)
    if (boss && !boss.defeated) {
      boss.defeated = true
      let bossKey = `boss_${this.formatId(bossId)}_defeated`
      server.persistentData.putBoolean(bossKey, true)
      console.log(`Босс ${boss.name} побежден! Отключаем связанные порталы.`)
      
      let players = server.getPlayers()
      players.forEach(player => {
        player.tell(`§6⚔️ Босс ${boss.name} побежден! Связанные с ним порталы отключены.`)
      })
      
      return true
    }
    return false
  },
  
  getActiveGateways: function() {
    let activeGateways = gateways.filter(gateway => {
      let boss = this.bosses.find(b => b.id === gateway.boss)
      return boss && !boss.defeated
    })
    
    console.log(`Активных порталов: ${activeGateways.length}`)
    return activeGateways
  }
}

let activeRaids = new Map()

// --- Инициализация ---
ServerEvents.loaded(event => {
  let server = event.server
  console.log("=== Инициализация системы портальных рейдов ===")
  
  if (!server.persistentData.contains('last_raid_time')) {
    server.persistentData.putLong('last_raid_time', server.overworld().getTime() - 5 * 24000)
    console.log("Инициализирован last_raid_time (установлен 5 дней назад)")
  }
  if (!server.persistentData.contains('next_raid_interval')) {
    server.persistentData.putLong('next_raid_interval', randomRaidInterval())
    console.log("Инициализирован next_raid_interval")
  }
  if (!server.persistentData.contains('next_raid_warning_sent')) {
    server.persistentData.putBoolean('next_raid_warning_sent', false)
    console.log("Инициализирован next_raid_warning_sent")
  }
  
  console.log("--- Система боссов ---")
  bossControlSystem.initialize(server)
  
  console.log("--- Активные порталы ---")
  let activeGateways = bossControlSystem.getActiveGateways()
  console.log(`ИТОГО: ${activeGateways.length} активных порталов`)
  
  console.log("=== Инициализация завершена ===")
})

// --- Смерть босса ---
EntityEvents.death(event => {
  let entity = event.entity
  let server = event.server
  
  let entityId = entity.type
  console.log(`Умерла сущность: ${entityId}`)
  
  let boss = bossControlSystem.bosses.find(b => b.id === entityId)
  if (boss && !boss.defeated) {
    console.log(`Обнаружен босс: ${boss.name}`)
    bossControlSystem.markBossDefeated(server, entityId)
  }
})

// --- Тики ---
ServerEvents.tick(event => {
  let server = event.server
  let time = server.overworld().getTime()
  let lastRaid = server.persistentData.getLong('last_raid_time')
  let raidInterval = server.persistentData.getLong('next_raid_interval')
  
  if (!server.persistentData.getBoolean('next_raid_warning_sent') && 
      time - lastRaid >= raidInterval - RAID_WARNING_TIME) {
    
    let players = server.getPlayers()
    if (players.length > 0) {
      players.forEach(player => {
        player.tell('§6⚠ Надвигается рейд порталов! У вас остался 1 игровой день для подготовки.')
      })
      server.persistentData.putBoolean('next_raid_warning_sent', true)
      console.log('Игроки предупреждены о скором рейде порталов')
    }
  }
  
  if (time % 200 === 0 && time - lastRaid >= raidInterval) {
    let players = server.getPlayers()
    if (players.length > 0) {
      let activeGateways = bossControlSystem.getActiveGateways()
      if (activeGateways.length > 0) {
        console.log(`Запуск портального рейда! Доступно ${activeGateways.length} активных порталов`)
        startRaid(server, players)
        server.persistentData.putLong('last_raid_time', time)
        server.persistentData.putLong('next_raid_interval', randomRaidInterval())
        server.persistentData.putBoolean('next_raid_warning_sent', false)
      } else {
        console.log("Нет активных порталов для рейда - пропускаем")
        server.persistentData.putLong('last_raid_time', time)
        server.persistentData.putLong('next_raid_interval', randomRaidInterval())
      }
    }
  }
})

// --- Запуск рейда ---
function startRaid(server, players) {
  let raidId = `raid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  try {
    let raid = { 
      raidId: raidId,
      players: players.map(p => p.username),
      startTime: server.overworld().getTime(),
      portalsSpawned: 0
    }
    
    activeRaids.set(raidId, raid)
    console.log(`Создан новый портальный рейд: ${raidId} для ${players.length} игроков`)

    spawnRaidPortals(server, players, raid)
    
    players.forEach(player => {
      player.tell(`§c⛁ Начинается портальный рейд! Появляются врата из других измерений!`)
    })
    
  } catch (e) {
    console.error(`Ошибка при создании рейда: ${e}`)
  }
}

// --- Спавн порталов ---
function spawnRaidPortals(server, players, raid) {
  let portalCount = randomBetween(1, 3) // От 1 до 3 порталов
  let activeGateways = bossControlSystem.getActiveGateways()
  
  if (activeGateways.length === 0) {
    console.log("Нет доступных порталов для спавна")
    return
  }

  console.log(`Спавн портального рейда: ${portalCount} порталов`)

  // Выбираем случайного игрока как точку отсчета
  let targetPlayer = players[Math.floor(Math.random() * players.length)]
  let playerPos = targetPlayer.blockPosition()
  
  // Получаем позиции вокруг игрока
  let possiblePositions = get3x3SpawnPositions(server, targetPlayer, playerPos)
  
  // Если нет позиций, используем запасные позиции рядом с игроком
  if (possiblePositions.length === 0) {
    for (let i = 0; i < 8; i++) {
      possiblePositions.push({
        x: playerPos.x + randomBetween(-15, 15),
        y: playerPos.y + 2,
        z: playerPos.z + randomBetween(-15, 15)
      })
    }
  }
  
  // Перемешиваем позиции и выбираем нужное количество
  let spawnPositions = shuffleArray(possiblePositions).slice(0, portalCount)
  
  // Спавним порталы
  let spawnedPortals = 0
  for (let i = 0; i < spawnPositions.length; i++) {
    let portalPos = spawnPositions[i]
    
    // Выбираем случайный активный портал
    let randomGateway = activeGateways[Math.floor(Math.random() * activeGateways.length)]
    
    try {
      let command = "execute run open_gateway " + portalPos.x + " " + portalPos.y + " " + portalPos.z + " gateways:" + randomGateway.path
      console.log(`Выполняется команда: ${command}`)
      
      let result = server.runCommandSilent(command)
      if (result) {
        console.log(`Создан портал: ${randomGateway.path} в позиции [${portalPos.x}, ${portalPos.y}, ${portalPos.z}]`)
        spawnedPortals++
        
        // Сообщаем игрокам о появлении портала(бета тестирование,вообще к слову не нужна)
        players.forEach(player => {
          player.tell(`§e⛁ Появился портал ${randomGateway.path} на координатах [${portalPos.x}, ${portalPos.y}, ${portalPos.z}]`)
        })
      } else {
        console.error(`Команда open_gateway не выполнена для ${randomGateway.path}`)
      }
    } catch (e) {
      console.error(`Ошибка при спавне портала ${randomGateway.path}: ${e}`)
    }
  }

  console.log(`Успешно заспавнено порталов: ${spawnedPortals}/${portalCount}`)
  raid.portalsSpawned = spawnedPortals
}

// --- Вспомогательная функция для перемешивания массива ---
function shuffleArray(array) {
  let newArray = []
  for (let i = 0; i < array.length; i++) {
    newArray.push(array[i])
  }
  for (let i = newArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = newArray[i]
    newArray[i] = newArray[j]
    newArray[j] = temp
  }
  return newArray
}

// --- Получение 8 позиций вокруг игрока по схеме 3x3 ---
function get3x3SpawnPositions(server, player, playerPos) {
  let positions = []
  let world = server.overworld()
  
  // 8 позиций вокруг игрока (все кроме центра)
  let offsets = [
    {x: -SPAWN_DISTANCE, z: -SPAWN_DISTANCE}, // верхний левый
    {x: 0, z: -SPAWN_DISTANCE},               // верхний центр
    {x: SPAWN_DISTANCE, z: -SPAWN_DISTANCE},  // верхний правый
    {x: -SPAWN_DISTANCE, z: 0},               // средний левый
    {x: SPAWN_DISTANCE, z: 0},                // средний правый
    {x: -SPAWN_DISTANCE, z: SPAWN_DISTANCE},  // нижний левый
    {x: 0, z: SPAWN_DISTANCE},                // нижний центр
    {x: SPAWN_DISTANCE, z: SPAWN_DISTANCE}    // нижний правый
  ]
  
  offsets.forEach(offset => {
    let x = playerPos.x + offset.x
    let z = playerPos.z + offset.z
    let y = findSafeY(world, x, z)
    
    if (y !== null) {
      positions.push({x: x, y: y, z: z})
      console.log(`Найдена позиция для портала: [${x}, ${y}, ${z}]`)
    } else {
      console.log(`Не удалось найти безопасную Y для позиции [${x}, ${z}]`)
    }
  })
  
  return positions
}

// --- Утилиты ---
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function findSafeY(world, x, z) {
  let maxY = world.getMaxBuildHeight()
  let minY = world.getMinBuildHeight()
  
  for (let y = maxY; y >= minY; y--) {
    let block = world.getBlock(x, y, z)
    let blockAbove = world.getBlock(x, y + 1, z)
    let blockBelow = world.getBlock(x, y - 1, z)
    
    if (isSolidBlock(blockBelow) && 
        isPassableBlock(block) && 
        isPassableBlock(blockAbove)) {
      return y
    }
  }
  
  for (let y = maxY; y >= minY; y--) {
    let block = world.getBlock(x, y, z)
    let blockAbove = world.getBlock(x, y + 1, z)
    let blockBelow = world.getBlock(x, y - 1, z)
    
    if (isSolidBlock(blockBelow) && isPassableBlock(blockAbove)) {
      return y
    }
  }
  
  return null
}

function isSolidBlock(block) {
  if (!block) return false
  let id = block.id
  return !id.includes('air') && 
         !id.includes('water') && 
         !id.includes('lava') &&
         !id.includes('leaves') &&
         !id.includes('slab') &&
         !id.includes('stairs') &&
         !id.includes('fence') &&
         !id.includes('wall') &&
         !id.includes('glass') &&
         !id.includes('carpet') &&
         !id.includes('snow')
}

function isPassableBlock(block) {
  if (!block) return true
  let id = block.id
  return id.includes('air') || 
         id.includes('water') || 
         id.includes('lava') ||
         id.includes('grass') ||
         id.includes('flower') ||
         id.includes('snow') ||
         id.includes('torch') ||
         id.includes('sign') ||
         id.includes('pressure_plate') ||
         id.includes('button') ||
         id.includes('lever') ||
         id.includes('carpet') ||
         id.includes('vine') ||
         id.includes('rail')
}

function randomRaidInterval() {
  return randomBetween(MIN_RAID_INTERVAL, MAX_RAID_INTERVAL)
}

// Команды для отладки и управления(вроде рабочий вариант,но отладка меток все равно нет)
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(
    Commands.literal('raids')
      .then(Commands.literal('info')
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let activeGateways = bossControlSystem.getActiveGateways()
          
          source.sendSuccess(Text.of('§6=== Система Портальных Рейдов ==='), false)
          source.sendSuccess(Text.of(`§fАктивных порталов: §a${activeGateways.length}`), false)
          
          source.sendSuccess(Text.of('§fСостояние боссов:'), false)
          bossControlSystem.bosses.forEach(boss => {
            let status = boss.defeated ? '§aПобежден' : '§cАктивен'
            let controlledPortals = gateways.filter(g => g.boss === boss.id).length
            source.sendSuccess(Text.of(`§7- ${boss.name}: ${status} (порталов: ${controlledPortals})`), false)
          })
          
          source.sendSuccess(Text.of(`§fАктивные рейды: §a${activeRaids.size}`), false)
          activeRaids.forEach((raid, id) => {
            source.sendSuccess(Text.of(`§7- Рейд ${id}: ${raid.portalsSpawned} порталов`), false)
          })
          
          return 1
        })
      )
      .then(Commands.literal('force')
        .requires(src => src.hasPermission(2))
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let players = server.getPlayers()
          
          if (players.length > 0) {
            let activeGateways = bossControlSystem.getActiveGateways()
            if (activeGateways.length > 0) {
              startRaid(server, players)
              source.sendSuccess(Text.of('§aПринудительно запущен портальный рейд!'), true)
            } else {
              source.sendSuccess(Text.of('§cНет активных порталов для запуска рейда!'), true)
            }
          } else {
            source.sendSuccess(Text.of('§cНет игроков онлайн для запуска рейда!'), true)
          }
          return 1
        })
      )
      .then(Commands.literal('reset')
        .requires(src => src.hasPermission(2))
        .executes(context => {
          let server = context.source.server
          let source = context.source
          
          server.persistentData.putLong('last_raid_time', 0)
          server.persistentData.putBoolean('next_raid_warning_sent', false)
          
          bossControlSystem.bosses.forEach(boss => {
            server.persistentData.putBoolean(`boss_${bossControlSystem.formatId(boss.id)}_defeated`, false)
            boss.defeated = false
          })
          
          activeRaids.clear()
          
          source.sendSuccess(Text.of('§aСистема портальных рейдов сброшена!'), true)
          return 1
        })
      )
      .then(Commands.literal('test_spawn_pattern')
        .requires(src => src.hasPermission(2))
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let pos = source.position
          
          let positions = get3x3SpawnPositions(server, source, {x: pos.x, y: pos.y, z: pos.z})
          
          source.sendSuccess(Text.of(`§6Найдено позиций для порталов: ${positions.length}/8`), true)
          
          // Спавним маркеры для визуализации
          positions.forEach((spawnPos, index) => {
            let color = index % 2 === 0 ? 'red' : 'blue'
            server.runCommandSilent(`summon minecraft:armor_stand ${spawnPos.x} ${spawnPos.y} ${spawnPos.z} {CustomName:'{"text":"Портал ${index+1}"}',CustomNameVisible:1b,Invisible:1b,Marker:1b,Glowing:1b}`)
          })
          
          source.sendSuccess(Text.of('§aСозданы маркеры позиций для порталов!'), true)
          return 1
        })
      )
      .then(Commands.literal('list_portals')
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let activeGateways = bossControlSystem.getActiveGateways()
          
          source.sendSuccess(Text.of('§6=== Список порталов ==='), false)
          source.sendSuccess(Text.of(`§fВсего порталов: ${gateways.length}`), false)
          source.sendSuccess(Text.of(`§fАктивных: ${activeGateways.length}`), false)
          
          // Группируем порталы по боссам
          let portalsByBoss = {}
          gateways.forEach(gateway => {
            if (!portalsByBoss[gateway.boss]) {
              portalsByBoss[gateway.boss] = []
            }
            portalsByBoss[gateway.boss].push(gateway)
          })
          
          Object.entries(portalsByBoss).forEach(([bossId, portals]) => {
            let boss = bossControlSystem.bosses.find(b => b.id === bossId)
            let bossName = boss ? boss.name : bossId
            let status = boss && boss.defeated ? '§a✓' : '§c✗'
            source.sendSuccess(Text.of(`§f${bossName} ${status}:`), false)
            portals.forEach(portal => {
              let activeStatus = activeGateways.includes(portal) ? '§a●' : '§8○'
              source.sendSuccess(Text.of(`§7  ${activeStatus} ${portal.path}`), false)
            })
          })
          
          return 1
        })
      )
  )
})



// откровенно говоря почище и по лучше(опыт решает,наверное)