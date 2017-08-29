const spawn = require('child_process').spawn;
const console = require('./tty').console;
const log = require('./log').log;


class SpawnWrapper {
    constructor(object) {

    }

    isEmpty(object) {
        for(var property in object) {
            if(object.hasOwnProperty(property)) {
                return false;
            }
        }
        return JSON.stringify(object) === JSON.stringify({});
    }

    defaultOptions(options) {
        if (this.isEmpty(options)) {
            return {
                'cwd': undefined,
                'detached': false,
            };
        }
        return options;
    }

    spawnWin32(object, options, ...args) {
        return spawn(
            object.has_a_tty.shell,
            [ ...object.has_a_tty.option,
                object.has_a_tty.call,
                object.has_a_tty.script,
                ...args
            ],
            options
        );
    }

    spawnDarwin(object, options, ...args) {
        return spawn(
            object.has_a_tty.shell,
            [ object.has_a_tty.option,
                object.has_a_tty.command(...args)
            ],
            options
        );
    }

    spawnWrapper(object, options, ...args) {
        switch (process.platform) {
            case 'linux':
            case 'win32':
                return this.spawnWin32(object, options, ...args);
            case 'darwin':
                return this.spawnDarwin(object, options, ...args);
            default:
                return null;
        }
    }

    spawnTTY(log, options, ...args) {
        let opts = this.defaultOptions(options);
        let tty = spawnWrapper(object, opts, ...args);
        if (log) {
            this.has_a_log(tty, opts, ...args);
        }
        return tty;
    }
}


class Type {
    constructor (object) {
        this.has_a_tty = object.has_a_tty;
        this.has_a_log = object.has_a_log;
        this.spawn_tty = object.spawn_tty;
    }
}
