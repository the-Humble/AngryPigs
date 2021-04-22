//Copyright (C) 2021 Jose Ignacio Ferrer Vera and Ana Carolina Arellano
'use strict'

import Game from './scripts/game/Game.js';
//Main

(function Main() {
    
    $(document).ready( event => {
        //get selected level from index
        var level = localStorage.getItem("Level")
        //call game and send level
        const app = new Game(level);
        //clear storage
        localStorage.removeItem("Level");
        localStorage.clear();
        app.run();
    })
})()