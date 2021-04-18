//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict'

import Game from './scripts/game/Game.js';
//Main

(function Main() {
    
    $(document).ready( event => {

        const app = new Game();
        app.run();
    })
})()