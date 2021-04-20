// Copyright (C) 2019 Scott Henshaw
'use strict';

import Physics from '../libs/Physics.js';
import GameObject from './GameObject.js';


export default class Level{

    constructor(filename = 'level_1.json'){
        this.filename = filename;
    }

    load(){
        return new Promise((resolve, reject) => {
            $.post('/api/load', {
                userId: "pg20jose",
                name: this.filename,
                type: "level" 
            })
            .then(levelDetails => {
                resolve(levelDetails);
            })
        })
    }
}
