'use strict';


// required for SpawnWrapper class
const spawn = require('child_process').spawn;


class Base {
    constructor(base, ...source){
        this.set(base, ...source)
    }

    get() {
        return this.object;
    }

    set(base, ...source) {
        if (null == base) {
            this.object = new Object();
        } else if (null == source) {
            this.object = Object.assign({}, base);
        } else {
            this.object = Object.assign(base, ...source);
        }
    }

    isEmpty() {
        for(var property in this.object) {
            if(this.object.hasOwnProperty(property)) {
                return false;
            }
        }
        return JSON.stringify(this.object) === JSON.stringify({});
    }
}


class LinuxSessionWrapper extends Base {
    constructor() {
        super();
        let shell = this.setupDefaultShell();
        let option = this.setupDefaultOption(shell);
        this.set({
            'shell': shell,
            'option': option
        });
    };

    getSessionTerminal() {
        switch (process.env.GDMSESSION) {
            case 'ubuntu':
            case 'ubuntu-2d':
            case 'gnome':
            case 'gnome-shell':
            case 'gnome-classic':
            case 'gnome-fallback':
            case 'cinnamon':
                return "gnome-terminal";
            case 'xfce':
                return "xfce4-terminal";
            case 'kde-plasma':
                return "konsole";
            case 'Lubuntu':
                return "lxterminal";
            default:
                return null;
        }
    }

    getDesktopTerminal() {
        switch (process.env.XDG_CURRENT_DESKTOP) {
            case 'Unity':
            case 'GNOME':
            case 'X-Cinnamon':
                return "gnome-terminal";
            case 'XFCE':
                return "xfce4-terminal";
            case 'KDE':
                return "konsole";
            case 'LXDE':
                return "lxterminal";
            default:
                return "xterm";
        }
    }

    setupDefaultShell() {
        let shell = this.getSessionTerminal();

        if (null === shell) {
            shell = this.getDesktopTerminal();
        }

        return shell;
    }

    setupDefaultOption(shell) {
        // determine the shells default execution option
        switch (shell) {
            case 'gnome-terminal':
            case 'xfce4-terminal':
                return "-x";
            case 'konsole':
            case 'lxterminal':
            default:
                return "-e";
        }
    }
};


class MetaShell extends Base {
    constructor(base, ...source) {
        super();
        this.setBase(base, ...source);
        this.setPath(base);
        this.setCommand();
    }

    setBase(base, ...source) {
        this.set({
            'shell': base.shell,
            'option': base.option,
            'call': base.call
        }, ...source);
    }

    setPath(base) {
        function defaultPath() {
            if ('win32' === process.platform) {
                return `${process.env.USERPROFILE}\\.atom\\packages\\atom-python-run\\cp\\main.py`;
            }
            return `${process.env.HOME}/.atom/packages/atom-python-run/cp/main.py`;
        }
        this.set(this.get(), {
            'script': (function(path) {
                if (null == path) {
                    path = defaultPath();
                }
                return path;
            })(base.script)
        });
    }

    setCommand() {
        let object = this.get();
        this.set(object, {
            'command': function (args) {
                let path = '';
                for (let token of args) {
                    path += ` ${token}`;
                }
                return `tell app "Terminal" to do script "${path}"`
            }
        });
    }
}


class Shell extends Base {
    constructor(path) {
        super();
        this.set(this.setUp(path));
    }

    win32(path) {
        return new MetaShell({
            'shell': process.env.COMSPEC,
            'option': ['/c', 'start'],
            'call': 'python',
            'script': path
        });
    }

    darwin(path) {
        return new MetaShell({
            'shell': 'osascript',
            'option': ['-e'],
            'call': 'python',
            'script': path
        });
    }

    linux(path) {
        let session = new LinuxSessionWrapper();
        return new MetaShell({
            'shell': session.get().shell,
            'option': [session.get().option],
            'call': 'python',
            'script': path
        });
    }

    setUp(path) {
        switch (process.platform) {
            case 'win32':
                return this.win32(path).object;
            case 'darwin':
                return this.darwin(path).object;
            case 'linux':
                return this.linux(path).object;
            default:
                return null;
        }
    }
}


class Log extends Base {
    constructor(base, ...source) {
        super();
        this.set(base, ...source)
    }

    metaData() {
        console.log(
            `platform: ${process.platform}\n` +
            `shell: ${this.object.meta.shell}\n` +
            `option: ${this.object.meta.option}\n` +
            `call: ${this.object.meta.call}\n` +
            `script: ${this.object.meta.script}\n` +
            `command: ${this.object.meta.command(this.get().args)}`
        );
    }

    data() {
        console.log(
            `pause: ${this.object.pause}\n` +
            `pipeFile: ${this.object.pipeFile}\n` +
            `pipePath: ${this.object.pipePath}\n` +
            `log: ${this.object.log}\n` +
            `args: ${this.object.args}\n` +
            `options: ${JSON.stringify(this.object.options, null, 4)}`
        );
    }

    tty() {
        this.object.tty.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        this.object.tty.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        this.object.tty.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    call() {
        this.metaData();
        this.data();
        this.tty();
    }
}


class SpawnWrapper extends Base {
    constructor(base, ...source) {
        super();
        this.set(base, ...source);
    }

    spawnArgs(model) {
        if (model.pause && !model.pipeFile) {
            return [this.object.call, this.object.script,
                '--pause', ...model.args
            ];
        }
        if (!model.pause && model.pipeFile) {
            return [this.object.call, this.object.script,
                '--file', model.pipePath, ...model.args
            ];
        }
        if (model.pause && model.pipeFile) {
            return [this.object.call, this.object.script,
                '-p', '-f', model.pipePath, ...model.args
            ];
        }
        return [this.object.call, this.object.script, ...model.args];
    }

    spawnWin32(model) {
        let args = this.spawnArgs(model);
        return spawn(
            this.object.shell,
            [...this.object.option, ...args],
            model.options
        )
    }

    spawnDarwin(model) {
        let args = this.spawnArgs(model);
        return spawn(
            this.object.shell,
            [...this.object.option, this.object.command(args)],
            model.options
        );
    }

    spawnWrapper(model) {
        switch (process.platform) {
            case 'linux':
            case 'win32':
                return this.spawnWin32(model);
            case 'darwin':
                return this.spawnDarwin(model);
            default:
                return null;
        }
    }

    optionWrapper(options) {
        function isEmpty(object) {
            for(var property in object) {
                if(object.hasOwnProperty(property)) {
                    return false;
                }
            }
            return JSON.stringify(object) === JSON.stringify({});
        }
        if (isEmpty(options)) {
            options = {
                'cwd': undefined,
                'detached': false
            };
        }
        return options;
    }

    tty(model) {
        model.options = this.optionWrapper(model.options);
        let tty = this.spawnWrapper(model);
        if (model.log) {
            new Log({
                'tty': tty,
                'meta': this.object,
            }, model).call();
        }
        return tty;
    }
}


exports.Base = Base;
exports.LinuxSessionWrapper = LinuxSessionWrapper;
exports.MetaShell = MetaShell;
exports.Shell = Shell;
exports.Log = Log;
exports.SpawnWrapper = SpawnWrapper;
