'use strict';


// required for SpawnWrapper class
const spawn = require('child_process').spawn;


/*
    ##########
    Base -- this class is the base class for all other classes
    ##########
    A base object is used in the construction of other objects.

    The object is named 'object' and stored within the constructed object as a
    property.

    This property can be accessed by using the get() and set() methods.

    The object property can be accessed directly as well for convenience and is
    named object for generic reference purposes because the name of an object
    is indeterminate.

    The isEmpty() method can be used to figure out whether the object contains
    a value or not.
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
    This object determines the default shell, and the default shell option, by
    determining the users current desktop environment (or session).

    By default, once a LinuxSessionWrapper object has be created, it will
    contain the default values which are appropriate for that Desktop Environment.

    This is only for linux because linux has a variety of desktop environments
    available.

    If another shell is used, this can be modified later during instantiation of
    a Shell object by modifying the shell and option property values.
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
    This is a blueprint for the Shell class.

    MetaShell is a special meta class that helps automate the constuction of
    metadata used to create a terminal instance.

    These objects are used to construct Shell instance objects utilized by the
    instantiated terminal object.

    While this object can be changed once instantiated by utilizing the
    setBase() method, it's typically best to pass any arguments to the
    constructor instead.

    All MetaShell objects have 5 properties:
        - shell     The terminal instance to be created
        - option    The terminal instance execution option
        - call      A REPL or Interpreter that executes 'script'
        - script    A program to execute given arguments within a 'shell'
        - command   The commands to be executed by 'script' (Mac OS X Only)

    i.e. :
        $ shell option call script
            translates to
        $ gnome-terminal -x python script.py
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
    The Shell class creates a Shell object according to its local environment.

    A 'path' can be passed to the constructor, appropriate method according to
    the local environment, or by manually invoking the setUp() method which
    determines the local environment automatically.

    The Shell object is used to define the metadata that is passed to a
    SpawnWrapper instance call which is then used to create a <ChildProcess>.

    'path' should always be a string. If 'path' is undefined, a default path
    is automatically set instead.
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
    Create a log object to capture and print basic i/o operations to
    standard output.

    A Log call will require an object during instantiation with the following
    format:
        - tty       Requires a <ChildProcess> instance
        - options   The options object passed to spawn()
        - args      The parameters to be executed by the terminal instance
        - cp        A boolean value that determines a terminal instance call
        - meta      The metadata to be passed to a terminal instance call

    The 'meta' property should contain a Shell instance object because the
    metaData() method expects specific properties to be available.

    This object should be used ONLY after spawn has executed and a tty instance
    has been created.

    NOTE:
    At least one key/value pair is required to create a valid Log instance, but
    will ultimately fail once the call() method is executed.
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
            `args: ${this.object.args}\n` +
            `cp: ${this.object.cp}`
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
    SpawnWrapper class creates a child_process.spawn() wrapper object.

    A Shell.object is passed to SpawnWrapper during instantiation.

    The Shell.tty() method is used to create a <ChildProcess> object.

    The tty() method takes a single object called 'model' which is a psuedo
    representation of how the <ChildProcess> object should be created.
        - log       A flag based Boolean value
        - cp        Ditto...
        - args      An array of arguments to be executed by a terminal instance
        - options   The 'options' object passed to child_process.spawn()

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
        function cp(object, ...args) {
            if (model.cp) {
                return [...object.option, object.call, object.script, ...args];
            } else {
                return [...object.option, ...args];
            }
        }
        return spawn(
            this.object.shell,
            [...cp(this.object, ...model.args)],
            model.options
        )
    }

    spawnDarwin(model) {
        // darwin should never be modified or configured in any way. doing
        // so risks breaking the required tool chain.
        return spawn(
            this.object.shell,
            [ ...this.object.option,
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
        model.options = this.optionWrapper(model.options);
        let tty = this.spawnWrapper(model);
        if (model.log) {
            new Log({
                'tty': tty,
                'args': model.args,
                'options': model.options,
                'cp': model.cp,
                'meta': this.object
            }).call();
        }
        return tty;
    }
}


// exports.Base = Base;
// exports.LinuxSessionWrapper = LinuxSessionWrapper;
// exports.MetaShell = MetaShell;
// exports.Log = Log;
exports.Shell = Shell;
exports.SpawnWrapper = SpawnWrapper;
