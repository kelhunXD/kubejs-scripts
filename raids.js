
// v 8.3.0 - Самая рабочая версия(примечание: скрипт очень много жрет пинга и фпс,советую использовать продвинутую версию с порталами,а еще эта версия кривая и ТУПАЯ)

let MIN_RAID_INTERVAL = 5 * 24000 // минимальный интервал
let MAX_RAID_INTERVAL = 7 * 24000 // максимальный интервал
let SPAWN_DISTANCE = 30 // расстояние от игрока для спавна
let RAID_DURATION_LIMIT = 2 * 24000 // 2 дня на завершение
let RAID_WARNING_TIME = 1 * 24000 // Предупреждение за 1 игровой день до рейда

console.log("Custom Raids Final v8.3.0 loaded! - Fixed Mob Distribution System")

// система боссов
let bossControlSystem = {
  bosses: [
    {
      id: 'cataclysm:ancient_remnant',
      name: 'Древнейший Ревенант',
      controlledGroups: ['group_4','group_5','group_6','group_7'],
      defeated: false
    },
    {
      id: 'cataclysm:maledictus',
      name: 'Маледиктус',
      controlledGroups: ['group_8','group_9','group_10','group_11'],
      defeated: false
    },
    {
      id:  'cataclysm:scylla',
      name: 'Сцилла',
      controlledGroups: ['group_14','group_15','group_16','group_17'],
      defeated: false
    },
    {
      id: 'cataclysm:the_leviathan',
      name: 'Левиафан',
      controlledGroups: ['group_18','group_19','group_20','group_21','group_22','group_23','group_24'],
      defeated: false
    },
    {
      id: 'alexscaves:luxtructosaurus',
      name: 'Люкстрозавр',
      controlledGroups: ['group_12','group_13'],
      defeated: false
    },
    {
      id: 'cataclysm:the_harbinger',
      name: 'Смотритель',
      controlledGroups: ['group_30'],
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
      console.log(`Босс ${boss.name} побежден! Отключаем контролируемые группы.`)
      
      let players = server.getPlayers()
      players.forEach(player => {
        player.tell(`§6⚔️ Босс ${boss.name} побежден! Контролируемые им группы рейдов отключены.`)
      })
      
      return true
    }
    return false
  },
  
  getActiveGroups: function() {
    let activeGroups = []
    
    mobGroups.forEach(group => {
      let controllingBosses = this.bosses.filter(boss => 
        boss.controlledGroups.includes(group.name)
      )
      
      let isActive = group.enabled && (
        controllingBosses.length === 0 || 
        controllingBosses.some(boss => !boss.defeated)
      )
      
      if (isActive) {
        activeGroups.push(group)
        console.log(`Группа ${group.displayName} АКТИВНА (контролируется: ${controllingBosses.map(b => b.name).join(', ') || 'нет'})`)
      } else {
        console.log(`Группа ${group.displayName} НЕАКТИВНА`)
      }
    })
    
    console.log(`ИТОГО активных групп: ${activeGroups.length}`)
    return activeGroups
  }
}

// NBT теги для мобов
let mobNBTTemplates = {
  'iceandfire:ice_dragon': {
    stage3: '{AgeTicks:1200000}',
    stage4: '{AgeTicks:1800000}',  
    stage5: '{AgeTicks:2400000}'
  },
  'iceandfire:fire_dragon': {
    stage3: '{AgeTicks:1200000}',
    stage4: '{AgeTicks:1800000}',
    stage5: '{AgeTicks:2400000}'
  },
  'iceandfire:lightning_dragon': {
    stage3: '{AgeTicks:1200000}',
    stage4: '{AgeTicks:1800000}',
    stage5: '{AgeTicks:2400000}'
  },
  
  'cataclysm:royal_draugr': {
    default: '{HandItems:[{id:"cataclysm:black_steel_sword",Count:1b},{id:"cataclysm:black_steel_targe",Count:1b}]}'
  },
  
  'cataclysm:elite_draugr': {
    default: '{HandItems:[{id:"minecraft:crossbow",Count:1b},{}]}'
  },
  
  'cataclysm:deepling_warlock': {
    default: '{HandItems:[{id:"cataclysm:athame",Count:1b},{}]}'
  },
  
  'cataclysm:deepling_brute': {
    default: '{HandItems:[{id:"cataclysm:coral_bardiche",Count:1b},{}]}'
  },
  
  'cataclysm:koboleton': {
    default: '{HandItems:[{id:"cataclysm:khopesh",Count:1b},{}]}'
  },
  
  'cataclysm:deepling_angler': {
    default: '{HandItems:[{id:"nethersdelight:iron_machete",Count:1b},{}]}'
  },
  
  'cataclysm:deepling': {
    default: '{HandItems:[{id:"cataclysm:coral_spear",Count:1b},{}]}'
  },
  
  'cataclysm:deepling_priest': {
    default: '{HandItems:[{id:"cataclysm:athame",Count:1b},{}]}'
  },
  
  'cataclysm:draugr': {
    default: '{HandItems:[{id:"cataclysm:black_steel_axe",Count:1b},{}]}'
  },
  
  'iceandfire:dread_lich': {
    default: '{HandItems:[{id:"iceandfire:lich_staff",Count:1b},{}]}'
  },
  
  'iceandfire:dread_knight': {
    default: '{HandItems:[{id:"iceandfire:dread_knight_sword",Count:1b},{id:"minecraft:shield",Count:1b}]}'
  },
  
  'iceandfire:dread_thrall': {
    default: '{HandItems:[{id:"iceandfire:dread_sword",Count:1b},{}]}'
  },
  
  'cataclysm:the_prowler': {
    enhanced: '{ActiveEffects:[{Id:1,Duration:999999,Amplifier:0b},{Id:5,Duration:999999,Amplifier:0b}]}'
  }
}

let mobGroups = [
  {
    name: "group_1",
    displayName: "Ледяной Дракон",
    spawnChance: 0.05,
    enabled: true,
    minMobs: 1,
    maxMobs: 1,
    mobs: [
      { id: 'iceandfire:ice_dragon', weight: 100, minCount: 1, maxCount: 1 }
    ]
  },
  {
    name: "group_2",
    displayName: "Огненный Дракон",
    spawnChance: 0.05,
    enabled: true,
    minMobs: 1,
    maxMobs: 1,
    mobs: [
      { id: 'iceandfire:fire_dragon', weight: 100, minCount: 1, maxCount: 1 }
    ]
  },
  {
    name: "group_3",
    displayName: "Грозовой Дракон",
    spawnChance: 0.05,
    enabled: true,
    minMobs: 1,
    maxMobs: 1,
    mobs: [
      { id: 'iceandfire:lightning_dragon', weight: 100, minCount: 1, maxCount: 1 }
    ]
  },
  {
    name: "group_4",
    displayName: "Отряд Пустыни",
    spawnChance: 0.15,
    enabled: true,
    minMobs: 3,
    maxMobs: 12,
    mobs: [
      { id: 'cataclysm:kobolediator', weight: 10, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:koboleton', weight: 70, minCount: 3, maxCount: 10 },
      { id: 'cataclysm:wadjet', weight: 10, minCount: 0, maxCount: 1 }
    ]
  },
  {
    name: "group_5",
    displayName: "Усиленный Отряд Пустыни",
    spawnChance: 0.14,
    enabled: true,
    minMobs: 4,
    maxMobs: 13,
    mobs: [
      { id: 'cataclysm:kobolediator', weight: 50, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:koboleton', weight: 70, minCount: 3, maxCount: 10 },
      { id: 'cataclysm:wadjet', weight: 10, minCount: 0, maxCount: 1 }
    ]
  },
  {
    name: "group_6",
    displayName: "Усиленный Отряд Пустыни",
    spawnChance: 0.13,
    enabled: true,
    minMobs: 4,
    maxMobs: 13,
    mobs: [
      { id: 'cataclysm:kobolediator', weight: 10, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:koboleton', weight: 70, minCount: 3, maxCount: 10 },
      { id: 'cataclysm:wadjet', weight: 50, minCount: 1, maxCount: 2 }
    ]
  },
  {
    name: "group_7",
    displayName: "Элитный Отряд Пустыни",
    spawnChance: 0.12,
    enabled: true,
    minMobs: 5,
    maxMobs: 19,
    mobs: [
      { id: 'cataclysm:kobolediator', weight: 30, minCount: 0, maxCount: 2 },
      { id: 'cataclysm:koboleton', weight: 70, minCount: 5, maxCount: 15 },
      { id: 'cataclysm:wadjet', weight: 50, minCount: 0, maxCount: 2 }
    ]
  },
  {
    name: "group_8",
    displayName: "Разведовательный Отряд Маледиктуса",
    spawnChance: 0.2,
    enabled: true,
    minMobs: 7,
    maxMobs: 15,
    mobs: [
      { id: 'cataclysm:draugr', weight: 70, minCount: 3, maxCount: 7 },
      { id: 'cataclysm:aptrgangr', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:elite_draugr', weight: 30, minCount: 1, maxCount: 3 },
      { id: 'cataclysm:royal_draugr', weight: 30, minCount: 1, maxCount: 3 }
    ]
  },
  {
    name: "group_9",
    displayName: "Усиленный Отряд Маледиктуса",
    spawnChance: 0.15,
    enabled: true,
    minMobs: 7,
    maxMobs: 17,
    mobs: [
      { id: 'cataclysm:draugr', weight: 70, minCount: 3, maxCount: 7 },
      { id: 'cataclysm:aptrgangr', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:elite_draugr', weight: 30, minCount: 1, maxCount: 5 },
      { id: 'cataclysm:royal_draugr', weight: 30, minCount: 1, maxCount: 3 }
    ]
  },
  {
    name: "group_10",
    displayName: "Усиленный Отряд Маледиктуса",
    spawnChance: 0.15,
    enabled: true,
    minMobs: 7,
    maxMobs: 17,
    mobs: [
      { id: 'cataclysm:draugr', weight: 70, minCount: 3, maxCount: 7 },
      { id: 'cataclysm:aptrgangr', weight: 20, minCount: 0, maxCount: 2 },
      { id: 'cataclysm:elite_draugr', weight: 30, minCount: 1, maxCount: 3 },
      { id: 'cataclysm:royal_draugr', weight: 30, minCount: 1, maxCount: 5 }
    ]
  },
  {
    name: "group_11",
    displayName: "Элитный Отряд Маледиктуса",
    spawnChance: 0.1,
    enabled: true,
    minMobs: 8,
    maxMobs: 22,
    mobs: [
      { id: 'cataclysm:draugr', weight: 70, minCount: 3, maxCount: 10 },
      { id: 'cataclysm:aptrgangr', weight: 30, minCount: 1, maxCount: 4 },
      { id: 'cataclysm:elite_draugr', weight: 30, minCount: 1, maxCount: 4 },
      { id: 'cataclysm:royal_draugr', weight: 30, minCount: 1, maxCount: 4 }
    ]
  },
  {
    name: "group_12",
    displayName: "Древние Ящеры",
    spawnChance: 0.11,
    enabled: true,
    minMobs: 4,
    maxMobs: 9,
    mobs: [
      { id: 'alexscaves:tremorsaurus', weight: 30, minCount: 1, maxCount: 3 },
      { id: 'alexscaves:vallumraptor', weight: 70, minCount: 3, maxCount: 8 }
    ]
  },
  {
    name: "group_13",
    displayName: "Стая Древних Ящеров",
    spawnChance: 0.1,
    enabled: true,
    minMobs: 7,
    maxMobs: 18,
    mobs: [
      { id: 'alexscaves:tremorsaurus', weight: 30, minCount: 2, maxCount: 5 },
      { id: 'alexscaves:vallumraptor', weight: 70, minCount: 5, maxCount: 15 }
    ]
  },
  {
    name: "group_14",
    displayName: "Разведовательный Отряд Шторма",
    spawnChance: 0.16,
    enabled: true,
    minMobs: 7,
    maxMobs: 15,
    mobs: [
      { id: 'cataclysm:clawdian', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:hippocamtus', weight: 50, minCount: 1, maxCount: 3 },
      { id: 'cataclysm:octohost', weight: 70, minCount: 5, maxCount: 8 },
      { id: 'cataclysm:cindaria', weight: 50, minCount: 1, maxCount: 3 }
    ]
  },
  {
    name: "group_15",
    displayName: "Усиленный Отряд Шторма",
    spawnChance: 0.15,
    enabled: true,
    minMobs: 9,
    maxMobs: 17,
    mobs: [
      { id: 'cataclysm:clawdian', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:hippocamtus', weight: 60, minCount: 3, maxCount: 5 },
      { id: 'cataclysm:octohost', weight: 70, minCount: 5, maxCount: 8 },
      { id: 'cataclysm:cindaria', weight: 50, minCount: 1, maxCount: 3 }
    ]
  },
  {
    name: "group_16",
    displayName: "Усиленный Отряд Шторма",
    spawnChance: 0.14,
    enabled: true,
    minMobs: 9,
    maxMobs: 17,
    mobs: [
      { id: 'cataclysm:clawdian', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:hippocamtus', weight: 50, minCount: 1, maxCount: 3 },
      { id: 'cataclysm:octohost', weight: 70, minCount: 5, maxCount: 8 },
      { id: 'cataclysm:cindaria', weight: 60, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_17",
    displayName: "Элитные Отряд Шторма",
    spawnChance: 0.12,
    enabled: true,
    minMobs: 13,
    maxMobs: 25,
    mobs: [
      { id: 'cataclysm:clawdian', weight: 30, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:hippocamtus', weight: 60, minCount: 3, maxCount: 5 },
      { id: 'cataclysm:octohost', weight: 70, minCount: 6, maxCount: 12 },
      { id: 'cataclysm:cindaria', weight: 60, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_18",
    displayName: "Разведовательный Отряд Подводной Бездны",
    spawnChance: 0.15,
    enabled: true,
    minMobs: 0,
    maxMobs: 10,
    mobs: [
      { id: 'cataclysm:coral_golem', weight: 30, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:coralssus', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:deepling_brute', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_warlock', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_priest', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_angler', weight: 20, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_19",
    displayName: "Усиленный Отряд Подводной Бездны",
    spawnChance: 0.14,
    enabled: true,
    minMobs: 7,
    maxMobs: 13,
    mobs: [
      { id: 'cataclysm:coral_golem', weight: 30, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:coralssus', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:deepling_brute', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_warlock', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_priest', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_angler', weight: 20, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_20",
    displayName: "Усиленный Отряд Подводной Бездны",
    spawnChance: 0.13,
    enabled: true,
    minMobs: 7,
    maxMobs: 17,
    mobs: [
      { id: 'cataclysm:coral_golem', weight: 30, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:coralssus', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:deepling_brute', weight: 20, minCount: 2, maxCount: 4 },
      { id: 'cataclysm:deepling_warlock', weight: 20, minCount: 0, maxCount: 2 },
      { id: 'cataclysm:deepling_priest', weight: 20, minCount: 0, maxCount: 2 },
      { id: 'cataclysm:deepling_angler', weight: 20, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_21",
    displayName: "Усиленный Отряд Подводной Бездны",
    spawnChance: 0.13,
    enabled: true,
    minMobs: 7,
    maxMobs: 15,
    mobs: [
      { id: 'cataclysm:coral_golem', weight: 30, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:coralssus', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:deepling_brute', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_warlock', weight: 20, minCount: 2, maxCount: 4 },
      { id: 'cataclysm:deepling_priest', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_angler', weight: 20, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_22",
    displayName: "Усиленный Отряд Подводной Бездны",
    spawnChance: 0.13,
    enabled: true,
    minMobs: 5,
    maxMobs: 17,
    mobs: [
      { id: 'cataclysm:coral_golem', weight: 30, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:coralssus', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:deepling_brute', weight: 20, minCount: 0, maxCount: 2 },
      { id: 'cataclysm:deepling_warlock', weight: 20, minCount: 0, maxCount: 2 },
      { id: 'cataclysm:deepling_priest', weight: 20, minCount: 2, maxCount: 4 },
      { id: 'cataclysm:deepling', weight: 20, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_23",
    displayName: "Усиленный Отряд Подводной Бездны",
    spawnChance: 0.13,
    enabled: true,
    minMobs: 2,
    maxMobs: 12,
    mobs: [
      { id: 'cataclysm:coral_golem', weight: 30, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:coralssus', weight: 20, minCount: 0, maxCount: 1 },
      { id: 'cataclysm:deepling_brute', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_warlock', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_priest', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling', weight: 20, minCount: 5, maxCount: 10 }
    ]
  },
  {
    name: "group_24",
    displayName: "Элитный Отряд Подводной Бездны",
    spawnChance: 0.12,
    enabled: true,
    minMobs: 12,
    maxMobs: 28,
    mobs: [
      { id: 'cataclysm:coral_golem', weight: 30, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:coralssus', weight: 20, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:deepling_brute', weight: 20, minCount: 1, maxCount: 4 },
      { id: 'cataclysm:deepling_warlock', weight: 20, minCount: 1, maxCount: 4 },
      { id: 'cataclysm:deepling_priest', weight: 20, minCount: 1, maxCount: 4 },
      { id: 'cataclysm:deepling', weight: 20, minCount: 7, maxCount: 12 }
    ]
  },
  {
    name: "group_25",
    displayName: "Отряд Ужасов",
    spawnChance: 0.15,
    enabled: true,
    minMobs: 6,
    maxMobs: 13,
    mobs: [
      { id: 'iceandfire:dread_thrall', weight: 40, minCount: 3, maxCount: 5 },
      { id: 'iceandfire:lich', weight: 30, minCount: 1, maxCount: 2 },
      { id: 'iceandfire:dread_knight', weight: 20, minCount: 2, maxCount: 3 }
    ]
  },
  {
    name: "group_26",
    displayName: "Усиленный Отряд Ужасов",
    spawnChance: 0.14,
    enabled: true,
    minMobs: 9,
    maxMobs: 16,
    mobs: [
      { id: 'iceandfire:dread_thrall', weight: 40, minCount: 1, maxCount: 5 },
      { id: 'iceandfire:dread_lich', weight: 30, minCount: 2, maxCount: 4 },
      { id: 'iceandfire:dread_knight', weight: 20, minCount: 1, maxCount: 7 }
    ]
  },
  {
    name: "group_27",
    displayName: "Усиленный Отряд Ужасов",
    spawnChance: 0.13,
    enabled: true,
    minMobs: 9,
    maxMobs: 16,
    mobs: [
      { id: 'iceandfire:dread_thrall', weight: 40, minCount: 4, maxCount: 7 },
      { id: 'iceandfire:dread_lich', weight: 30, minCount: 2, maxCount: 4 },
      { id: 'iceandfire:dread_knight', weight: 20, minCount: 3, maxCount: 5 }
    ]
  },
  {
    name: "group_28",
    displayName: "Элитный Отряд Ужасов",
    spawnChance: 0.12,
    enabled: true,
    minMobs: 13,
    maxMobs: 25,
    mobs: [
      { id: 'iceandfire:dread_thrall', weight: 40, minCount: 5, maxCount: 10 },
      { id: 'iceandfire:dread_lich', weight: 30, minCount: 3, maxCount: 5 },
      { id: 'iceandfire:dread_knight', weight: 20, minCount: 5, maxCount: 10 }
    ]
  },
  {
    name: "group_29",
    displayName: "Отряд Льда,Огня,Молний",
    spawnChance: 0.01,
    enabled: true,
    minMobs: 3,
    maxMobs: 3,
    mobs: [
      { id: 'iceandfire:fire_dragon', weight: 100, minCount: 1, maxCount: 1 },
      { id: 'iceandfire:ice_dragon', weight: 100, minCount: 1, maxCount: 1 },
      { id: 'iceandfire:lightning_dragon', weight: 100, minCount: 1, maxCount: 1 }
    ]
  },
  {
    name: "group_30",
    displayName: "Отряд Механизмов",
    spawnChance: 0.15,
    enabled: true,
    minMobs: 4,
    maxMobs: 8,
    mobs: [
      { id: 'cataclysm:the_prowler', weight: 50, minCount: 1, maxCount: 2 },
      { id: 'cataclysm:the_watcher', weight: 30, minCount: 3, maxCount: 5 }
    ]
  }
]

let activeRaids = new Map()

// --- Инициализация ---
ServerEvents.loaded(event => {
  let server = event.server
  console.log("=== Инициализация системы рейдов ===")
  
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
  
  console.log("--- Состояния групп ---")
  mobGroups.forEach(group => {
    let groupKey = `raid_group_${group.name}_enabled`
    if (!server.persistentData.contains(groupKey)) {
      server.persistentData.putBoolean(groupKey, group.enabled)
      console.log(`Инициализирована группа: ${group.name} - ${group.enabled}`)
    } else {
      group.enabled = server.persistentData.getBoolean(groupKey)
      console.log(`Загружена группа: ${group.name} - ${group.enabled}`)
    }
  })
  
  console.log("--- Система боссов ---")
  bossControlSystem.initialize(server)
  
  console.log("--- Активные группы ---")
  let activeGroups = bossControlSystem.getActiveGroups()
  console.log(`ИТОГО: ${activeGroups.length} активных групп`)
  
  console.log("=== Инициализация завершена ===")
})

// --- Смерть моба ---
EntityEvents.death(event => {
  let entity = event.entity
  let server = event.server
  let tags = entity.getTags()
  
  let entityId = entity.type
  console.log(`Умерла сущность: ${entityId}`)
  
  let boss = bossControlSystem.bosses.find(b => b.id === entityId)
  if (boss && !boss.defeated) {
    console.log(`Обнаружен босс: ${boss.name}`)
    if (bossControlSystem.markBossDefeated(server, entityId)) {
      boss.controlledGroups.forEach(groupName => {
        let group = mobGroups.find(g => g.name === groupName)
        if (group) {
          group.enabled = false
          server.persistentData.putBoolean(`raid_group_${groupName}_enabled`, false)
          console.log(`Группа ${group.displayName} отключена после победы над ${boss.name}`)
        }
      })
    }
  }

  for (let [id, raid] of activeRaids.entries()) {
    if (tags.contains(raid.raidTag)) {
      raid.mobsKilled++
      let progress = Math.min(raid.mobsKilled / raid.totalMobs, 1)
      
      try {
        server.runCommandSilent(`bossbar set ${raid.bossbarId} value ${Math.floor(progress * 100)}`)
        server.runCommandSilent(`bossbar set ${raid.bossbarId} name {"text":"§6Рейд ${raid.groupName} - Убито: ${raid.mobsKilled}/${raid.totalMobs}"}`)
      } catch (e) {
        console.error(`Ошибка при обновлении боссбара: ${e}`)
      }

      if (raid.mobsKilled >= raid.totalMobs) {
        try {
          server.runCommandSilent(`bossbar set ${raid.bossbarId} color green`)
          server.runCommandSilent(`bossbar set ${raid.bossbarId} name {"text":"§a✅ Рейд завершён успешно!"}`)
          
          giveRaidReward(server, raid)
          
          server.scheduleInTicks(60, () => {
            removeBossbar(server, raid.bossbarId, id)
          })
          
          console.log(`Рейд ${id} завершен успешно`)
        } catch (e) {
          console.error(`Ошибка при завершении рейда: ${e}`)
        }
      }
    }
  }
})

// --- УЛУЧШЕННАЯ система здоровья для драконов ---
EntityEvents.spawned(event => {
  let entity = event.entity
  let entityId = entity.type
  
  if (entityId.includes('dragon') && entity.getTags().contains('kubejs_raid')) {
    // Определяем целевое здоровье в зависимости от стадии
    let ageTicks = entity.nbt.AgeTicks || 0
    let healthMap = {
      1200000: 300,   // Стадия 3
      1800000: 500,   // Стадия 4
      2400000: 750    // Стадия 5
    }
    
    let targetHealth = healthMap[ageTicks] || 150
    
    console.log(`Лечение дракона ${entityId}, стадия: ${ageTicks}, целевое HP: ${targetHealth}`)
    
    // Сначала устанавливаем базовое здоровье(как же я ненавижу драконов,они такие сломанные)
    entity.setHealth(targetHealth)
    
    // Даем мощное мгновенное исцеление несколько раз с интервалами
    for (let attempt = 1; attempt <= 5; attempt++) {
      event.server.scheduleInTicks(attempt * 3, () => {
        if (!entity.isAlive()) return
        
        try {
          // Мощное мгновенное исцеление (уровень 10 = +48 здоровья,но это не точно)
          entity.potionEffects.add('minecraft:instant_health', 1, 10, false, false)
          console.log(`[Попытка ${attempt}] Дракону дан эффект мгновенного исцеления уровня 10`)
          
          // Дополнительно устанавливаем здоровье напрямую
          if (entity.health < targetHealth * 0.8) {
            entity.setHealth(targetHealth)
          }
        } catch (e) {
          console.error(`Ошибка при лечении дракона (попытка ${attempt}): ${e}`)
        }
      })
    }
    
    // Также даем эффект регенерации на 30 секунд(хз работает нет)
    event.server.scheduleInTicks(10, () => {
      if (entity.isAlive()) {
        entity.potionEffects.add('minecraft:regeneration', 600, 3, false, false)
        console.log(`Дракону дан эффект регенерации уровня 3`)
      }
    })
    
    // Финальная проверка и установка здоровья
    event.server.scheduleInTicks(30, () => {
      if (entity.isAlive()) {
        let currentHealth = entity.health
        if (currentHealth < targetHealth * 0.9) {
          entity.setHealth(targetHealth)
          console.log(`Финальная установка здоровья дракона: ${currentHealth} -> ${targetHealth} HP`)
        } else {
          console.log(`Здоровье дракона установлено: ${currentHealth}/${targetHealth} HP`)
        }
      }
    })
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
        player.tell('§6⚠ Надвигается рейд! У вас остался 1 игровой день для подготовки.')
      })
      server.persistentData.putBoolean('next_raid_warning_sent', true)
      console.log('Игроки предупреждены о скором рейде')
    }
  }
  
  // Обновление боссбаров для всех активных рейдов(вот это хрень ест много фпс)
  if (time % 100 === 0) { // Каждые 5 секунд
    activeRaids.forEach((raid, id) => {
      try {
        let players = server.getPlayers()
        // Обновляем боссбар для всех текущих игроков
        players.forEach(player => {
          server.runCommandSilent(`bossbar set ${raid.bossbarId} players ${player.username}`)
        })
      } catch (e) {
        console.error(`Ошибка при обновлении боссбара для рейда ${id}: ${e}`)
      }
    })
  }
  
  for (let [id, raid] of activeRaids.entries()) {
    if (time - raid.startTime >= RAID_DURATION_LIMIT) {
      try {
        server.runCommandSilent(`bossbar set ${raid.bossbarId} color dark_red`)
        server.runCommandSilent(`bossbar set ${raid.bossbarId} name {"text":"§4❌ Рейд провален по времени!"}`)
        
        let players = server.getPlayers()
        players.forEach(player => {
          player.tell('§4Рейд провален! Вы не успели уничтожить всех мобов за 2 игровых дня.')
        })
        
        server.scheduleInTicks(60, () => {
          removeBossbar(server, raid.bossbarId, id)
        })
        
        console.log(`Рейд ${id} провален по истечении времени`)
      } catch (e) {
        console.error(`Ошибка при провале рейда по времени: ${e}`)
      }
    }
  }
  
  if (time % 200 === 0 && time - lastRaid >= raidInterval) {
    let players = server.getPlayers()
    if (players.length > 0) {
      let activeGroups = bossControlSystem.getActiveGroups()
      if (activeGroups.length > 0) {
        console.log(`Запуск рейда! Доступно ${activeGroups.length} активных групп`)
        startRaid(server, players)
        server.persistentData.putLong('last_raid_time', time)
        server.persistentData.putLong('next_raid_interval', randomRaidInterval())
        server.persistentData.putBoolean('next_raid_warning_sent', false)
      } else {
        console.log("Нет активных групп для рейда - пропускаем")
        server.persistentData.putLong('last_raid_time', time)
        server.persistentData.putLong('next_raid_interval', randomRaidInterval())
      }
    }
  }
})

// --- Запуск рейда ---
function startRaid(server, players) {
  let group = selectRandomGroup()
  if (!group) {
    console.log("Не удалось выбрать группу для рейда")
    return
  }

  let raidId = `raid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  let barId = `bar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  let raidTag = `${raidId}_tag`

  try {
    server.runCommandSilent(`bossbar add ${barId} {"text":"§6Рейд ${group.displayName} начинается..."}`)
    server.runCommandSilent(`bossbar set ${barId} color red`)
    server.runCommandSilent(`bossbar set ${barId} max 100`)
    server.runCommandSilent(`bossbar set ${barId} value 0`)
    server.runCommandSilent(`bossbar set ${barId} visible true`)
    
    // Устанавливаем боссбар для каждого игрока индивидуально(не работает,но это не точно)
    players.forEach(player => {
      server.runCommandSilent(`bossbar set ${barId} players ${player.username}`)
    })

    let raid = { 
      bossbarId: barId, 
      raidTag: raidTag, 
      totalMobs: 0, 
      mobsKilled: 0, 
      groupName: group.displayName,
      groupType: group.name,
      players: players.map(p => p.username),
      startTime: server.overworld().getTime()
    }
    
    activeRaids.set(raidId, raid)
    console.log(`Создан новый рейд: ${raidId} для ${players.length} игроков`)

    spawnRaidMobs(server, players, group, raid)
    
    players.forEach(player => {
      player.tell(`§c⚔️ Начинается рейд: ${group.displayName}! Уничтожьте всех мобов за 2 дня!`)
    })
    
    // Дополнительное обновление боссбара через 1 секунду для новых игроков(хрень безполезная,но мне лень скрипт переделывать так что кому надо - копайтесь и оскорбляйте меня за то что я долбоеб)
    server.scheduleInTicks(20, () => {
      if (activeRaids.has(raidId)) {
        let currentPlayers = server.getPlayers()
        currentPlayers.forEach(player => {
          server.runCommandSilent(`bossbar set ${barId} players ${player.username}`)
        })
        console.log(`Боссбар обновлен для ${currentPlayers.length} игроков`)
      }
    })
    
  } catch (e) {
    console.error(`Ошибка при создании рейда: ${e}`)
  }
}

// --- Функция для получения NBT тегов ---
function getMobNBT(mobId) {
  if (mobId.includes('dragon')) {
    let stage = randomBetween(3, 5)
    let ageTicksMap = {3: 1200000, 4: 1800000, 5: 2400000}
    let ageTicks = ageTicksMap[stage]
    console.log(`Устанавливаем AgeTicks: ${ageTicks} (стадия ${stage}) для дракона ${mobId}`)
    return `{AgeTicks:${ageTicks}}`
  }
  
  if (mobNBTTemplates[mobId]) {
    // предметы для мобов
    if (mobNBTTemplates[mobId].default) {
      let selectedNBT = mobNBTTemplates[mobId].default
      console.log(`Применен NBT для ${mobId}: ${selectedNBT}`)
      return selectedNBT
    }
    
    else if (Math.random() < 0.3) {
      let templates = Object.values(mobNBTTemplates[mobId])
      let selectedNBT = templates[Math.floor(Math.random() * templates.length)]
      console.log(`Применен NBT для ${mobId}: ${selectedNBT}`)
      return selectedNBT
    }
  }
  
  return '{}'
}

// --- Спавн мобов ---
function spawnRaidMobs(server, players, group, raid) {
  let playerCount = players.length
  let multiplier = 1 + (playerCount - 1) * 0.5

  let totalMobs = Math.round(randomBetween(group.minMobs, group.maxMobs) * multiplier)
  raid.totalMobs = totalMobs

  console.log(`Спавн рейда: ${group.displayName}, всего мобов: ${totalMobs}, множитель: ${multiplier}`)

  // равномерное распределение мобов
  let mobsToSpawn = []
  
  // 1. Сначала добавляем минимальное количество для каждого моба
  group.mobs.forEach(mob => {
    for (let i = 0; i < mob.minCount; i++) {
      mobsToSpawn.push(mob.id)
    }
  })

  // 2. Если после этого остались свободные слоты, заполняем их случайными мобами с учетом весов
  let remainingSlots = totalMobs - mobsToSpawn.length
  
  if (remainingSlots > 0) {
    let weightedMobsList = []
    for (let mob of group.mobs) {
      // Учитываем максимальное количество для каждого моба
      let currentCount = mobsToSpawn.filter(id => id === mob.id).length
      let availableSlots = Math.max(0, mob.maxCount - currentCount)
      
      // Добавляем моба в список столько раз, сколько позволяет его вес и доступные слоты
      for (let i = 0; i < Math.min(mob.weight, availableSlots * 10); i++) {
        weightedMobsList.push(mob.id)
      }
    }
    
    // Заполняем оставшиеся слоты(это не казино!)
    for (let i = 0; i < remainingSlots && weightedMobsList.length > 0; i++) {
      let randomIndex = Math.floor(Math.random() * weightedMobsList.length)
      let selectedMobId = weightedMobsList[randomIndex]
      mobsToSpawn.push(selectedMobId)
      
      // Обновляем взвешенный список, убирая мобов, которые достигли лимита
      weightedMobsList = weightedMobsList.filter(id => {
        let mob = group.mobs.find(m => m.id === id)
        let currentCount = mobsToSpawn.filter(spawnId => spawnId === id).length
        return currentCount < mob.maxCount
      })
    }
  }

  // 3. Перемешиваем итоговый список для случайного порядка спавна
  mobsToSpawn = shuffleArray(mobsToSpawn)

  console.log(`Распределение мобов для спавна:`, mobsToSpawn.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1
    return acc
  }, {}))

  // Выбираем случайного игрока как точку отсчета
  let targetPlayer = players[Math.floor(Math.random() * players.length)]
  let playerPos = targetPlayer.blockPosition()
  
  // Получаем 8 позиций вокруг игрока и выбираем одну случайную
  let possiblePositions = get3x3SpawnPositions(server, targetPlayer, playerPos)
  
  // Если нет позиций, используем запасную позицию рядом с игроком
  if (possiblePositions.length === 0) {
    possiblePositions = [{
      x: playerPos.x + randomBetween(-10, 10),
      y: playerPos.y + 2,
      z: playerPos.z + randomBetween(-10, 10)
    }]
  }
  
  // Выбираем одну случайную позицию для всей группы
  let groupSpawnPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)]
  console.log(`Вся группа будет спавниться в позиции: [${groupSpawnPos.x}, ${groupSpawnPos.y}, ${groupSpawnPos.z}]`)

  // Спавним всех мобов из подготовленного списка
  let spawnedMobs = 0
  for (let i = 0; i < mobsToSpawn.length; i++) {
    let mobId = mobsToSpawn[i]
    
    // Добавляем небольшой разброс, чтобы мобы не спавнились точно в одной точке
    let spawnOffsetX = randomBetween(-3, 3)
    let spawnOffsetZ = randomBetween(-3, 3)
    let finalSpawnPos = {
      x: groupSpawnPos.x + spawnOffsetX,
      y: groupSpawnPos.y,
      z: groupSpawnPos.z + spawnOffsetZ
    }
    
    try {
      let baseTags = `{Tags:["kubejs_raid","${raid.raidTag}"],Glowing:1b,PersistenceRequired:1b`
      
      let additionalNBT = getMobNBT(mobId)
      
      let fullNBT = baseTags
      if (additionalNBT && additionalNBT !== '{}') {
        let innerNBT = additionalNBT.substring(1, additionalNBT.length - 1)
        fullNBT += ',' + innerNBT
      }
      fullNBT += '}'
      
      let command = `summon ${mobId} ${finalSpawnPos.x} ${finalSpawnPos.y} ${finalSpawnPos.z} ${fullNBT}`
      console.log(`Выполняется команда: ${command}`)
      
      let result = server.runCommandSilent(command)
      if (result) {
        console.log(`Создан моб: ${mobId} в позиции [${finalSpawnPos.x}, ${finalSpawnPos.y}, ${finalSpawnPos.z}]`)
        spawnedMobs++
      } else {
        console.error(`Команда summon не выполнена для ${mobId}`)
      }
    } catch (e) {
      console.error(`Ошибка при спавне моба ${mobId}: ${e}`)
    }
  }

  console.log(`Успешно заспавнено мобов: ${spawnedMobs}/${totalMobs}`)

  try {
    server.runCommandSilent(`bossbar set ${raid.bossbarId} name {"text":"§6Рейд ${raid.groupName} - Убито: 0/${raid.totalMobs}"}`)
  } catch (e) {
    console.error(`Ошибка при обновлении боссбара после спавна: ${e}`)
  }
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
      console.log(`Найдена позиция для спавна: [${x}, ${y}, ${z}]`)
    } else {
      console.log(`Не удалось найти безопасную Y для позиции [${x}, ${z}]`)
    }
  })
  
  return positions
}

// --- Награда за рейд ---
function giveRaidReward(server, raid) {
  try {
    let players = server.getPlayers()
    players.forEach(player => {
      server.runCommandSilent(`experience add ${player.username} 50 points`)
      player.tell('§a+50 опыта за успешное завершение рейда!')
    })
    console.log(`Награды выданы за рейд ${raid.groupName}`)
  } catch (e) {
    console.error(`Ошибка при выдаче награды: ${e}`)
  }
}

// --- Удаление боссбара ---
function removeBossbar(server, bossbarId, raidId) {
  try {
    // Сначала скрываем боссбар для всех игроков
    let players = server.getPlayers()
    players.forEach(player => {
      server.runCommandSilent(`bossbar set ${bossbarId} visible false`)
    })
    
    // Затем удаляем
    server.runCommandSilent(`bossbar remove ${bossbarId}`)
    console.log(`Боссбар ${bossbarId} успешно удален`)
  } catch (e) {
    console.error(`Ошибка при удалении боссбара ${bossbarId}: ${e}`)
    try {
      server.runCommandSilent(`bossbar set ${bossbarId} visible false`)
      console.log(`Боссбар ${bossbarId} скрыт`)
    } catch (e2) {
      console.error(`Не удалось даже скрыть боссбар ${bossbarId}: ${e2}`)
    }
  } finally {
    if (activeRaids.has(raidId)) {
      activeRaids.delete(raidId)
      console.log(`Рейд ${raidId} удален из активных`)
    }
  }
}

// --- Утилиты ---
function selectRandomGroup() {
  let enabledGroups = bossControlSystem.getActiveGroups()
  if (enabledGroups.length === 0) {
    console.log("Нет доступных групп для рейда")
    return null
  }
  
  let totalChance = enabledGroups.reduce((sum, group) => sum + group.spawnChance, 0)
  let randomValue = Math.random() * totalChance
  let currentChance = 0
  
  for (let group of enabledGroups) {
    currentChance += group.spawnChance
    if (randomValue <= currentChance) {
      console.log(`Выбрана группа рейда: ${group.displayName} (шанс: ${group.spawnChance})`)
      return group
    }
  }
  
  console.log("Не удалось выбрать группу, возвращаем первую доступную")
  return enabledGroups[0]
}

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

// Команды для отладки и управления(они сломанные,ибо мне лень править на верный синтаксис)
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(
    Commands.literal('raids')
      .then(Commands.literal('info')
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let activeGroups = bossControlSystem.getActiveGroups()
          
          source.sendSuccess(Commands.literal(`§6=== Система Рейдов ===`), false)
          source.sendSuccess(Commands.literal(`§fАктивные группы: §a${activeGroups.length}`), false)
          activeGroups.forEach(group => {
            let controllingBosses = bossControlSystem.bosses.filter(boss => 
              boss.controlledGroups.includes(group.name)
            )
            let bossInfo = controllingBosses.length > 0 ? 
              ` (контроль: ${controllingBosses.map(b => `${b.name}${b.defeated ? '§a✓' : '§c✗'}`).join(', ')})` : ''
            source.sendSuccess(Commands.literal(`§7- ${group.displayName} §f${group.spawnChance * 100}%${bossInfo}`), false)
          })
          
          source.sendSuccess(Commands.literal(`§fСостояние боссов:`), false)
          bossControlSystem.bosses.forEach(boss => {
            let status = boss.defeated ? '§aПобежден' : '§cАктивен'
            let controlledGroups = mobGroups.filter(g => boss.controlledGroups.includes(g.name)).map(g => g.displayName).join(', ')
            source.sendSuccess(Commands.literal(`§7- ${boss.name}: ${status} (контролирует: ${controlledGroups || 'нет'})`), false)
          })
          
          source.sendSuccess(Commands.literal(`§fАктивные рейды: §a${activeRaids.size}`), false)
          activeRaids.forEach((raid, id) => {
            source.sendSuccess(Commands.literal(`§7- ${raid.groupName}: ${raid.mobsKilled}/${raid.totalMobs} мобов`), false)
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
            let activeGroups = bossControlSystem.getActiveGroups()
            if (activeGroups.length > 0) {
              startRaid(server, players)
              source.sendSuccess(Commands.literal('§aПринудительно запущен рейд!'), true)
            } else {
              source.sendSuccess(Commands.literal('§cНет активных групп для запуска рейда!'), true)
            }
          } else {
            source.sendSuccess(Commands.literal('§cНет игроков онлайн для запуска рейда!'), true)
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
          
          mobGroups.forEach(group => {
            server.persistentData.putBoolean(`raid_group_${group.name}_enabled`, true)
            group.enabled = true
          })
          
          activeRaids.forEach((raid, id) => {
            removeBossbar(server, raid.bossbarId, id)
          })
          activeRaids.clear()
          
          source.sendSuccess(Commands.literal('§aСистема рейдов сброшена!'), true)
          return 1
        })
      )
      .then(Commands.literal('test_dragon_heal')
        .requires(src => src.hasPermission(2))
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let pos = source.position
          
          let ageTicks = 2400000
          let command = `summon iceandfire:fire_dragon ${pos.x} ${pos.y + 2} ${pos.z} {AgeTicks:${ageTicks},Tags:["test_dragon"],Glowing:1b}`
          
          if (server.runCommandSilent(command)) {
            source.sendSuccess(Commands.literal(`§aТестовый дракон создан с AgeTicks: ${ageTicks}`), true)
            source.sendSuccess(Commands.literal(`§6Должен получить мгновенное исцеление до 750 HP`), true)
          } else {
            source.sendSuccess(Commands.literal(`§cОшибка при создании дракона`), true)
          }
          return 1
        })
      )
      .then(Commands.literal('test_dragon_heal_v2')
        .requires(src => src.hasPermission(2))
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let pos = source.position
          
          // Создаем дракона с низким здоровьем для теста(это для себя любимого)
          let ageTicks = 2400000
          let command = `summon iceandfire:fire_dragon ${pos.x} ${pos.y + 2} ${pos.z} {AgeTicks:${ageTicks},Tags:["test_dragon","kubejs_raid"],Health:10f,Attributes:[{Name:"generic.max_health",Base:750d}]}`
          
          if (server.runCommandSilent(command)) {
            source.sendSuccess(Commands.literal(`§aТестовый дракон создан с 10/750 HP`), true)
            source.sendSuccess(Commands.literal(`§6Должен получить лечение до 750 HP`), true)
          } else {
            source.sendSuccess(Commands.literal(`§cОшибка при создании дракона`), true)
          }
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
          
          source.sendSuccess(Commands.literal(`§6Найдено позиций для спавна: ${positions.length}/8`), true)
          
          // Спавним маркеры для визуализации(не работают)
          positions.forEach((spawnPos, index) => {
            let color = index % 2 === 0 ? 'red' : 'blue'
            server.runCommandSilent(`summon minecraft:armor_stand ${spawnPos.x} ${spawnPos.y} ${spawnPos.z} {CustomName:'{"text":"Точка ${index+1}"}',CustomNameVisible:1b,Invisible:1b,Marker:1b,Glowing:1b}`)
          })
          
          // Выбираем случайную позицию для группы и отмечаем ее
          let groupPos = positions[Math.floor(Math.random() * positions.length)]
          server.runCommandSilent(`summon minecraft:armor_stand ${groupPos.x} ${groupPos.y} ${groupPos.z} {CustomName:'{"text":"ГРУППА","color":"green"}',CustomNameVisible:1b,Invisible:1b,Marker:1b,Glowing:1b}`)
          
          source.sendSuccess(Commands.literal(`§aСозданы маркеры! Зеленый - точка спавна группы`), true)
          return 1
        })
      )
      .then(Commands.literal('fix_bossbars')
        .requires(src => src.hasPermission(2))
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let players = server.getPlayers()
          
          activeRaids.forEach((raid, id) => {
            players.forEach(player => {
              server.runCommandSilent(`bossbar set ${raid.bossbarId} players ${player.username}`)
              server.runCommandSilent(`bossbar set ${raid.bossbarId} visible true`)
            })
          })
          
          source.sendSuccess(Commands.literal(`§aБоссбары исправлены для ${players.length} игроков`), true)
          return 1
        })
      )
      .then(Commands.literal('test_mob_distribution')
        .requires(src => src.hasPermission(2))
        .executes(context => {
          let server = context.source.server
          let source = context.source
          let players = server.getPlayers()
          let group = selectRandomGroup()
          
          if (!group) {
            source.sendSuccess(Commands.literal('§cНет доступных групп!'), true)
            return 1
          }
          
          // Тестовый вызов с множителем 1 (1 игрок)
          let testMobs = simulateMobDistribution(group, 1)
          
          source.sendSuccess(Commands.literal(`§6Тест распределения для: ${group.displayName}`), false)
          let distribution = testMobs.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1
            return acc
          }, {})
          
          Object.entries(distribution).forEach(([mobId, count]) => {
            let mobConfig = group.mobs.find(m => m.id === mobId)
            let minMaxInfo = mobConfig ? ` (min: ${mobConfig.minCount}, max: ${mobConfig.maxCount})` : ''
            source.sendSuccess(Commands.literal(`§7- ${mobId}: ${count} мобов${minMaxInfo}`), false)
          })
          
          source.sendSuccess(Commands.literal(`§fВсего: ${testMobs.length} мобов`), false)
          source.sendSuccess(Commands.literal(`§fОжидаемый диапазон: ${group.minMobs}-${group.maxMobs} мобов`), false)
          
          return 1
        })
      )
  )
})

// Вспомогательная функция для тестирования распределения мобов
function simulateMobDistribution(group, playerCount) {
  let multiplier = 1 + (playerCount - 1) * 0.5
  let totalMobs = Math.round(randomBetween(group.minMobs, group.maxMobs) * multiplier)
  
  let mobsToSpawn = []
  
  // Минимальное количество
  group.mobs.forEach(mob => {
    for (let i = 0; i < mob.minCount; i++) {
      mobsToSpawn.push(mob.id)
    }
  })

  // Дополнительные мобы
  let remainingSlots = totalMobs - mobsToSpawn.length
  
  if (remainingSlots > 0) {
    let weightedMobsList = []
    for (let mob of group.mobs) {
      let currentCount = mobsToSpawn.filter(id => id === mob.id).length
      let availableSlots = Math.max(0, mob.maxCount - currentCount)
      
      for (let i = 0; i < Math.min(mob.weight, availableSlots * 10); i++) {
        weightedMobsList.push(mob.id)
      }
    }
    
    for (let i = 0; i < remainingSlots && weightedMobsList.length > 0; i++) {
      let randomIndex = Math.floor(Math.random() * weightedMobsList.length)
      let selectedMobId = weightedMobsList[randomIndex]
      mobsToSpawn.push(selectedMobId)
      
      weightedMobsList = weightedMobsList.filter(id => {
        let mob = group.mobs.find(m => m.id === id)
        let currentCount = mobsToSpawn.filter(spawnId => spawnId === id).length
        return currentCount < mob.maxCount
      })
    }
  }
  
  return shuffleArray(mobsToSpawn)
}



// боже мой какая же это хуйня,я так заебался,не поверите,а эта хуйня не работает)))