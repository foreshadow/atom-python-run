'use strict';


// required for SpawnWrapper class
const spawn = require('child_process').spawn;


/*
    ##########
    Base -- this class is the base class for all other classes
    ##########
    this is a special meta class that helps automate the constuction of objects on the fly.

    these objects are used to construct class Type objects contained by the main terminal object.

    class Type has 3 objects named has_a_tty, has_a_log, and spawn_tty.

    these objects are utilized by the end user and are modifiable.
*/
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


/*
    ##########
    LinuxSessionWrapper -- determine the default shell for the given desktop environment
    ##########
    this object determines the default shell, and the default shell option, by determining the users
    current desktop environment (or session).

    this is for linux only because linux has a variety of desktop environments available.
    if another shell is used, this can be modified via the Type instance through the has_a_tty

    property value.
*/
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
            case 'xterm':
                return "-e";
            default:
                return null;
        }
    }
};


/*
    ##########
    MetaShell -- a class used to create meta data for a terminal instance
    ##########
    this is a special meta class that helps automate the constuction of meta terminal objects on
    the fly.

    these objects are used to construct class Shell objects contained by the main terminal object.

    class Shell defines and creates the has_a_tty object for class Type.
*/
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
            'command': function (...args) {
                let path = object.call + " " + object.script;
                for (let token of args) {
                    path += ` ${token}`;
                }
                return `tell app "Terminal" to do script "${path}"`
            }
        });
    }
}


/*
    ##########
    Shell -- a class used to create meta data for a terminal instance
    ##########
    this is class helps to automate the constuction of the terminal objects meta data.

    this meta data object is used to pass arguments to the child_process.spawn method.

    class Shell defines and creates the object to be passed to SpawnWrapper
*/
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
                return this.win32(path).get();
            case 'darwin':
                return this.darwin(path).get();
            case 'linux':
                return this.linux(path).get();
            default:
                return null;
        }
    }
}


/*
    ##########
    Log -- automate the logging process while executing in atom.
    ##########
    create a log object to capture and print basic i/o operations to standard output.

    NOTE:
    this object should be used ONLY after spawn has executed and a tty instance has been created.
*/
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

    params() {
        console.log(
            `options: ${JSON.stringify(this.object.options, null, 4)}\n` +
            `args: ${this.object.args}`
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
        this.params();
        this.tty();
    }
}


/*
    ##########
    SpawnWrapper -- creates a spawn wrapper object
    ##########
    This object determines how to pass arguments to the invoked shell instance.

    The object passed to this wrapper is the Shell object. The instance of the Shell
    object is used to determine the call that is made to the child_process.spawn method.

    Once a wrapper instance has been instantiated, the only method that should be called
    is the tty() method.

    SpawnWrapper.tty() will return the active <ChildProcess> object after execution.

    NOTE:
    Even though this object requires a Shell instance object to instantiate itself,
    this process is mainly automated.
*/
class SpawnWrapper extends Base {
    constructor(base, ...source) {
        super();
        this.set(base, ...source);
    }

    spawnWin32(model) {
        function runCp(...args) {
            if (model.cp) {
                return [...this.object.option, this.object.call, this.object.script, ...args];
            } else {
                return [...this.object.option, ...args]
            }
        }
        return spawn(
            this.object.shell,
            [...runCp(model.args)],
            model.options
        )
    }

    spawnDarwin(model) {
        // darwin should never be modified or configured in any way. doing
        // so risks breaking the required tool chain.
        return spawn(
            this.object.shell,
            [ this.object.option,
                this.object.command(...model.args)
            ],
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
        object.options = this.optionWrapper(object.options);
        let tty = this.spawnWrapper(model);
        if (object.log) {
            new Log({
                'tty': tty,
                'args': model.args,
                'options': model.options,
                'meta': this.object
            }).call();
        }
        return tty;
    }
}


exports.Shell = Shell;
exports.SpawnWrapper = SpawnWrapper;
