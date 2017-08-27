/*
    CREATE A META TERMINAL OBJECT THAT IS DEFINED BY OPERATING SYSTEM TYPE

    automatically create a TTY object.

    create a TTY object based on the current operating system.

    this object contains all the required information for executing a script within a tty instance.

    has_a_tty is the function to utilize in automating the process.
*/
'use strict';


const linux = require('./linux');


class TTY {
    constructor(object) {
        this.setUp(object);
    }

    object() {
        return {
            'shell': this.shell,
            'option': this.option,
            'call': this.call,
            'script': this.script,
            'command': this.command
        }
    }

    setBase(object) {
        this.shell = object.shell;
        this.option = object.option;
        this.call = object.call;
    }

    setPath(object) {
        this.script = (function(path) {
            if (null == path) {
                if ('win32' === process.platform) {
                    path = `${process.env.USERPROFILE}\\.atom\\packages\\atom-python-run\\cp\\main.py`;
                } else {
                    path =  `${process.env.HOME}/.atom/packages/atom-python-run/cp/main.py`;
                }
            }
            return path;
        })(object.path);
    }

    setCommand(object) {
        if ('darwin' === process.platform) {
            this.command = function (...args) {
                let path = this.call + " " + this.script;
                for (let token of args) {
                    path += ` ${token}`;
                }
                return `tell app "Terminal" to do script "${path}"`
            };
        } else {
            this.command = null;
        }
    }

    setUp(object) {
        this.setBase(object);
        this.setPath(object);
        this.setCommand(object);
    }
}


class Console {
    constructor(path) {
        this.has_a_tty = this.setUp(path);
    }

    getTTY() {
        return this.has_a_tty.object();
    }

    setTTY(object) {
        this.has_a_tty.setUp(object);
    }

    win32(path) {
        return new TTY({
            'shell': process.env.COMSPEC,
            'option': ['/c', 'start'],
            'call': 'python',
            'path': path
        });
    }

    darwin(path) {
        return new TTY({
            'shell': 'osascript',
            'option': ['-e'],
            'call': 'python',
            'path': path
        });
    }

    linux(path) {
        return new TTY({
            'shell': linux.terminal.shell,
            'option': [linux.terminal.option],
            'call': 'python',
            'path': path
        });
    }

    setUp(path) {
        switch (process.platform) {
            case 'win32':
                return this.win32(path);
            case 'darwin':
                return this.darwin(path);
            case 'linux':
                return this.linux(path);
            default:
                return undefined;
        }
    }
}


exports.console = new Console();
