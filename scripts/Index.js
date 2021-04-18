// Copyright (c) 2021, Ana Carolina Arellano
'use strict';

import Game from './Game.js';

//Main appplication

//Application starts at chosen level
$(".play").on(`click`, event => {
    let game = new Game(); 
    game.run();
});
//Application shows instructions
$(".instructions").on(`click`, event => {
    //Display instructions
});
//Application shows instructions
$(".levelEditor").on(`click`, event => {
    //Change to level editor
});






