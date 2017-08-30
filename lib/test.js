'use strict';


const terminal = require('./terminal');

let object = {
    'log': true,
    'options': {},
    'args': [
        'python',
        `${process.env.HOME}/Documents/Python/hello.py`
    ]
}

let type = new terminal.Type();

type.spawn.tty(object);
