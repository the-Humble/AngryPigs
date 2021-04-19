//Copyright (C) Jose Ignacio Ferrer Vera
'use strict';

import World from "./World";

export default class Game{

    constructor(){
        this.gameState = Game.STATE.SPLASH;
        this.world = new World($('#game-area'));
        //load the level
        //build world model
        //set up event handlers for user
            //aim cannon
            //fire cannon
            //win/lose

        //start listening
    }

    static get STATE() {
        //GameState
        return{
            SPLASH:0,
            LOADING:1,
            GAME: 2,
            RESULTS:3,
        }
        //Use check(Game.STATE.LOADING)
   }

    update( dt ) {
       
        if (this.gameState != Game.STATE.GAME)
        {
            return;
        }
        //update special things

       //update the world
       this.world.update(dt);
    }

    render( dt ) {
        this.world.render(dt);
   }

    run( timestep = 0 ) {

        let dt = timestep - this.lastUpdate;

        this.update( dt );
        this.render( dt );

        window.requestAnimationFrame( dt => this.run( dt / 100 ));
    }
}