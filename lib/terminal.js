/*
    terminal.js - cross-platform compatible base for executing 3rd party apps
    Copyright (C) 2017  xovertheyearsx@gmail.com

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

    <https://www.gnu.org/licenses/gpl-2.0.txt>

    terminal.type.has_a_tty.shell
        compatible shells listed by system type

        "linux":
            ["gnome-terminal", "konsole", "terminator", "xfce4-terminal",
            "lxterminal", "uxterm", "xterm"]
                uses default based on current desktop environment

        "win32":
            ["cmd","powershell","bash"]
                defaults to cmd

        "darwin":
            ["osascript", "terminal"]
                defaults to osascript
*/
'use strict';

const spawn = require('child_process').spawn;

let get_linux_shell = function () {
    switch (process.env.GDMSESSION) {
        // if session is using gtk
        case 'ubuntu':
        case 'ubuntu-2d':
        case 'gnome':
        case 'gnome-shell':
        case 'gnome-classic':
        case 'gnome-fallback':
        case 'cinnamon':
            return "gnome-terminal";
        // xfce session has its own terminal, xfce is gtk compatible
        case 'xfce':
            return "xfce4-terminal";
        // if session is using qt, kde and lxde are qt compatible
        case 'kde-plasma':
            return "konsole";
        case 'Lubuntu':
            return "lxterminal";
        default:
            // attempt to determine desktop session
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
                // if unknown session, default to xterm
                default:
                    return "xterm";
            }
    }
};

let get_linux_option = function (shell) {
    // determine the shells default execution option
    switch (shell) {
        case 'gnome-terminal':
        case 'xfce4-terminal':
            return "-x"
        case 'konsole':
        case 'lxterminal':
        case 'xterm':
            return "-e"
        default:
            return "-e"
    }
};

let Get_Linux_Terminal = function () {
    let name = get_linux_shell();
    this.name = name;
    this.option = get_linux_option(name);
}

let LinuxTTY = function () {
    // linux has a mass variety of environments and a variety of ways
    // for determining those environments. best to go for the base
    // environments by depending on the most common builtin shells instead.
    // https://askubuntu.com/questions/72549/how-to-determine-which-window-manager-is-running
    let terminal = new Get_Linux_Terminal();
    this.shell = terminal.name;
    this.option = [terminal.option];
    this.call = 'python';
    this.script = `${process.env.HOME}/.atom/packages/atom-python-run/cp/main.py`;
};

let Win32TTY = function () {
    // windows xp and up can be gaurenteed to have the cmd.exe shell.
    // %comspec% should default to %windir%\system32\cmd.exe unless
    // otherwise modified by the end user.
    // https://en.wikipedia.org/wiki/Environment_variable#Windows
    this.shell = process.env.COMSPEC;
    this.option = ['/c', 'start'];
    this.call = 'python';
    this.script = `${process.env.USERPROFILE}\\.atom\\packages\\atom-python-run\\cp\\main.py`;
};

let DarwinTTY = function () {
    // NOTE: osascript should always be used! consider your self warned!
    // the default shell is determined by the Terminal.app settings.
    // the path method must be called in order to generate a valid
    // command every time it is called. the command property contains
    // an empty primitive string otherwise.
    this.shell = 'osascript';
    this.option = '-e';
    this.command = function (...args) {
        let path = `python ${process.env.HOME}/.atom/packages/atom-python-run/cp/main.py`;
        for (let token of args) {
            path += ` ${token}`;
        }
        return `tell app "Terminal" to do script "${path}"`
    };
};

let has_a_tty = function () {
    switch (process.platform) {
        case 'linux':
            return new LinuxTTY();
        case 'darwin':
            return new DarwinTTY();
        case 'win32':
            return new Win32TTY();
    }
};

let has_a_log = function (tty, options, ...args) {
    console.log(
        `platform: ${process.platform}\n` +
        `has_a_tty:\n\tshell: ${this.has_a_tty.shell}\n` +
        `\toption: ${this.has_a_tty.option}\n`
    );
    if ("darwin" === process.platform) {
        console.log(`\tcommand: ${this.has_a_tty.command(...args)}\n`);
    } else {
        console.log(`\tcall: ${this.has_a_tty.call}\n`);
        console.log(`\tscript: ${this.has_a_tty.script}\n`);
    }
    console.log(
        "spawn_tty:\n" +
        `\toptions:\n${JSON.stringify(options, null, 4)}\n` +
        `\targs: ${[...args]}\n`
    );
    tty.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    tty.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    tty.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
};

let is_empty = function (object) {
    for(var property in object) {
        if(object.hasOwnProperty(property)) {
            return false;
        }
    }
    return JSON.stringify(object) === JSON.stringify({});
}

let set_up_default = function (options) {
    if (is_empty(options)) {
        return {
            'cwd': undefined,
            'detached': false,
        };
    }
    return options
}

let spawns_tty = function (log, options, ...args) {
    let tty;
    options = set_up_default(options);
    switch (process.platform) {
        // NOTE: Linux OS Types
        // this just works regardless of how the arguments are passed.
        // as long as everything is recieved in the right way by the
        // cp-linux executable, it should just work.
        // NOTE: Win32 OS Types
        // win32 has some weird path based bug from when spawn() spawns a tty
        // to the point where it calls and attempts to pass the path to the
        // cp-win32 executable. the command and path to the executable must
        // remain as seperate arguments to spawn. theoretically, command does not
        // have to be "start". it can just be the cp-win32 executable and should
        // spawn a new shell regardless. that would require command to hold the
        // cp-win32 path and the cp-win32 path to be removed from this block.
        // NOTE: Darwin OS Types
        // darwin should never be modified or configured in any way. doing
        // so risks breaking the required tool chain.
        // NOTE: Darwin has a weird bug that causes multiple windows to spawn.
        case 'linux':
        case 'win32':
            tty = spawn(
                this.has_a_tty.shell,
                [
                    ...this.has_a_tty.option,
                    this.has_a_tty.call,
                    this.has_a_tty.script,
                    ...args,
                ],
                options
            )
            break;
        case 'darwin':
            tty = spawn(
                this.has_a_tty.shell,
                [
                    this.has_a_tty.option,
                    this.has_a_tty.command(...args),
                ],
                options
            );
            break;
    }
    if (log) {
        this.has_a_log(tty, options, ...args);
    }
    return tty;
};

let Type = function () {
    this.has_a_tty = has_a_tty();
    this.has_a_log = has_a_log;
    this.spawns_tty = spawns_tty;
};

exports.type = new Type();
