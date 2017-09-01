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

let shell = new terminal.Shell();

let spawn = new terminal.SpawnWrapper(shell.object);

spawn.tty(object);
