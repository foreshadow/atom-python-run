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

    Type() creates an instance that refers to the local machines graphical tty
    (terminal, shell, prompt, etc...).

    The global value returned by this module is an instance created from Type
        exports.type = new Type();

    Assuming exports.type is called as
        let terminal = require('/path/to/terminal');

    terminal.type is an object that consists of 2 main properties. the rest
    is handled by the constructor so you don't have to worry about calling
    a new process for each system type.

    The constructor consists of 5 methods and 1 property object.

    NOTE: get_linux_terminal, set_linux_terminal, and has_a_tty are all handled
    internally by the constructor and should not require any modifications.

    NOTE: if you want to modify the shell, options, or command properties, you
    can do so with the has_a_tty property.

        terminal.type.get_linux_terminal()
            returns the name of a linux compatible shell

        terminal.type.set_linux_terminal()
            returns an object containing the name of the default shell and
            an option to execute the following arguments

        terminal.type.has_a_tty()
            returns an object representing the commands the shell should execute

        terminal.type.spawns_tty()
            spawns a graphical tty and returns <ChildProcess>

        terminal.type.has_a_log()
            outputs executed properties to built-in console. this is typically
            executed each time a tty is spawned with terminal.type.spawns_tty().
            NOTE: there is a speed cost for executing this and should only be
            handled by the constructor.

        terminal.type.has_a_tty
            a property constructed by has_a_tty(). This property object is passed
            to spawns_tty() internally and can be configured by modifying its
            raw string properties

    the way terminal.type.has_a_tty is set is system dependent.
    If you're on a Windows or Mac OS X machine, you'll have 3 properties.
    If you're on a Linux machince, you'll have 2 properties.

    terminal.type
        terminal.type.spawns_tty(...[arguments], {options})
            a basic wrapper for nodes child_process.spawn()
            https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options

            returns a <ChildProcess> based on the [arguments] and {options}
            parameters. [arguments] should be passed as ...array and {options}
            should be passed as {object}. [arguments] can be passed as seperate
            primitive string based arguments as well.

            for example,
            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator

            const terminal = require('./terminal');

            var tty = terminal.type.spawns_tty(
                {
                    cwd: undefined,
                    detached: true,
                },
                "python",
                "-c",
                "print('Hello, World!');input('...enter to continue...')"
            );

                or with the spread operator

            var commands = [
                "python", "-c",
                "print('Hello, World!');input('...enter to continue...')"
            ];

            var tty = terminal.type.spawns_tty(
                {
                    cwd: undefined,
                    detached: true,
                },
                ...commands
            );

        terminal.type.has_a_tty
            this property has 2 - 3 primitive string based properties depending
            on your system.

        terminal.type.has_a_tty.shell
            the graphical tty executable (or the shell it self)

        terminal.type.has_a_tty.option
            the options to be passed to the graphical tty executable

        terminal.type.has_a_tty.command
            For win32 and darwin only. Usually Windows or Mac OS X will need
            a special argument in order to execute a 3rd party executable.

            for win32 (Windows)
                cmd /c start file-to.exe
            for darwin (Mac OS X)
                osascript -e 'tell app "Terminal" to do script "/path/to/executable"'

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

let get_linux_terminal = function () {
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

let LinuxTTY = function () {
    // linux has a mass variety of environments and a variety of ways
    // for determining those environments. best to go for the base
    // environments by depending on the most common builtin shells instead.
    // https://askubuntu.com/questions/72549/how-to-determine-which-window-manager-is-running
    let terminal = get_linux_terminal();
    this.shell = terminal;
    this.option = get_linux_option(terminal);
    this.command = `${process.env.HOME}/.atom/packages/atom-python-run/bin/cp-linux2.6.32-x86_64`;
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
        let path = `${process.env.HOME}/.atom/packages/atom-python-run/bin/cp-darwin13.4.0-x86_64`;
        for (let token of args) {
            path += ` ${token}`;
        }
        return `tell app "Terminal" to do script "${path}"`
    };
};

let Win32TTY = function () {
    // windows xp and up can be gaurenteed to have the cmd.exe shell.
    // %comspec% should default to %windir%\system32\cmd.exe unless
    // otherwise modified by the end user.
    // https://en.wikipedia.org/wiki/Environment_variable#Windows
    this.shell = process.env.COMSPEC;
    this.option = '/c';
    this.command = `start ${process.env.HOME}\\.atom\\packages\\atom-python-run\\bin\\cp-win32`;
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
        console.log(`\tcommand: ${this.has_a_tty.command}\n`);
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
        case 'linux':
        case 'win32':
            tty = spawn(
                this.has_a_tty.shell,
                [
                    this.has_a_tty.option,
                    this.has_a_tty.command,
                    ...args,
                ],
                options
            )
            break;
        case 'darwin':
            // darwin should never be modified or configured in any way. doing
            // so risks breaking the required tool chain.
            // NOTE: there is a weird bug that causes multiple windows to spawn.
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
