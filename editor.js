//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict'

import Editor from './scripts/Editor.js';
//Main

(function Main() {
    
    $(document).ready( event => {

        const app = new Editor();
        app.run();
    })
})()