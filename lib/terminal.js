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

    NOTE: Windows
        windows xp and up can be gaurenteed to have the cmd.exe shell.
        %comspec% should default to %windir%\system32\cmd.exe unless otherwise modified by the
        end user.
        https://en.wikipedia.org/wiki/Environment_variable#Windows

        win32 has some weird path based bug from when spawn() spawns a tty to the point where it
        calls and attempts to pass the path to cp/main.py. the command and path to the executable
        must remain as seperate arguments to spawn. theoretically, command does not have to be
        "start". it can just be cp/main.py and should spawn a new shell regardless.

    NOTE: Linux
        linux has a mass variety of environments and a variety of ways
        for determining those environments. best to go for the base
        environments by depending on the most common builtin shells instead.
        https://askubuntu.com/questions/72549/how-to-determine-which-window-manager-is-running

        this just works regardless of how the arguments are passed.
        as long as everything is recieved in the right way by cp/main.py, it should just work.

    NOTE: Darwin
        NOTE: osascript should always be used! consider your self warned!
        NOTE: Darwin has a weird bug that causes multiple windows to spawn.

        the default shell is determined by the Terminal.app settings.
        the path method must be called in order to generate a valid command every time it is called.
        the command property contains an empty primitive string otherwise.

        darwin should never be modified or configured in any way. doing so risks breaking the
        required tool chain.


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
const has_a_tty = require('./src/tty').has_a_tty;
const has_a_log = require('./src/log').has_a_log;


let is_empty = function (object) {
    for(var property in object) {
        if(object.hasOwnProperty(property)) {
            return false;
        }
    }
    return JSON.stringify(object) === JSON.stringify({});
};


let spawn_default_options = function (options) {
    if (is_empty(options)) {
        return {
            'cwd': undefined,
            'detached': false,
        };
    }
    return options;
};


let spawn_win32 = function (object, options, ...args) {
    return spawn(
        object.has_a_tty.shell,
        [ ...object.has_a_tty.option,
            object.has_a_tty.call,
            object.has_a_tty.script,
            ...args
        ],
        options
    );
};


let spawn_darwin = function (object, options, ...args) {
    return spawn(
        object.has_a_tty.shell,
        [ object.has_a_tty.option,
            object.has_a_tty.command(...args)
        ],
        options
    );
};


let spawns_tty = function (log, options, ...args) {
    let tty;
    let opts = spawn_default_options(options);
    switch (process.platform) {
        case 'linux':
        case 'win32':
            tty = spawn_win32(this, opts, ...args);
            break;
        case 'darwin':
            tty = spawn_darwin(this, opts, ...args);
            break;
    }
    if (log) {
        this.has_a_log(tty, opts, ...args);
    }
    return tty;
};


let Type = function () {
    this.has_a_tty = has_a_tty;
    this.has_a_log = has_a_log;
    this.spawns_tty = spawns_tty;
};


exports.type = new Type();
