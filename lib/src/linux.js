/*
    CREATE A LINUX CONSOLE WINDOW

    automatically determine the linux os desktop environment.

    create an object based on the current desktop session being used in linux.

    this object contains information for the default shell and the proper execution option to be passed to that shell.

    the methods get_shell() and get_option() can be used instead of the properties shell and option.

    this.shell and this.option are convenience properties.
*/
'use strict';


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


exports.session_wrapper = new LinuxSessionWrapper();
