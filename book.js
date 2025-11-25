

// простенький скрипт на одноразовую выдачу книги квестов
PlayerEvents.loggedIn(event => {
    const player = event.player
    //проверка на спец nbt тэг
    if (!player.persistentData.contains('first_join')) {
        // выдача предмета
        player.give('ftbquests:book')
        
        // ставим флаг на игроке
        player.persistentData.putBoolean('first_join', true)
        
        // сообщение(кому надо)
        // player.tell('Добро пожаловать! Вот ваша книга квестов.')
    }
})