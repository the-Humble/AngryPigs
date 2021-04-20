// Copyright (c) 2021, Ana Carolina Arellano
'use strict';

import Game from './game/Game.js';

//Main appplication
$("#play").on(`click`, event => {
    //Application starts at chosen level
    console.log("Click en play")
    let levelName = $("#level-list").children("option:selected").val()
    console.log(levelName)
    let game = new Game(levelName); 
    game.run();
});
        
        
        







