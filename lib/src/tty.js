/*
    CREATE A META TERMINAL OBJECT THAT IS DEFINED BY OPERATING SYSTEM TYPE

    automatically create a TTY object.

    create a TTY object based on the current operating system.

    this object contains all the required information for executing a script within a tty instance.

    has_a_tty is the function to utilize in automating the process.
*/
'use strict';


const linux = require('./linux').session_wrapper;


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
            this.object = Object.assign(base, ...source)
        }
        (function log(object, base, ...source) {
            console.log(
                `base: ${JSON.stringify(base)}\n` +
                `source: ${JSON.stringify(source)}\n` +
                `this: ${JSON.stringify(object.object)}\n`
            );
        })(this, base, ...source);
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
                    return defaultPath();
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
        return new MetaShell({
            'shell': linux.get().shell,
            'option': [linux.get().option],
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

exports.Base = Base;
exports.MetaShell = MetaShell;
exports.Shell = Shell;
