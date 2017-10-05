const terminal = require('./terminal');

let shell, spawn;

shell = new terminal.Shell()

// console.log(shell.object);

spawn = new terminal.SpawnWrapper(shell.object);

// console.log(spawn.object);

tty = spawn.tty({
    'pause': true,
    'pipeFile': false,
    'pipePath': '',
    'log': true,
    'args': ['python', `${process.env.USERPROFILE}\\Dropbox\\Source\\Python\\hello.py`],
    // 'args': ['python', `${process.env.HOME}/Dropbox/Source/Python/hello.py`],
    'options': new Object()
});

tty.unref();
