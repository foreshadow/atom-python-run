/*
    NOTE: win32 and linux only!
    NOTE: do not modify the has_a_tty properties on mac os x!

    terminal.type.spawns_tty executes these properties when called.
    each property can me modified according to your personal needs.

    modify the default shell
    terminal.type.has_a_tty.shell = "shell_name_here";

    modify the options passed to shell
    terminal.type.has_a_tty.option = "--options-go-here";

    modify the the command
    default (win32 only)
    if ("win32" === process.platform) terminal.type.has_a_tty.command = "start";
    default (darwin only)
    if ("darwin" === process.platform) {
      const stringify = terminal.type.has_a_tty.command;
      terminal.type.has_a_tty.command = stringify(...args);
    }
*/
/* global atom */
'use strict';

const CompositeDisposable = require('atom').CompositeDisposable;
const path = require('path');
let terminal = require('./terminal');


module.exports = {
    activate() {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
            atom.commands.add('atom-text-editor', 'Python run: run-f5', run_f5),
            atom.commands.add('atom-text-editor', 'Python run: run-f6', run_f6)
        );
    },
    deactivate() {
        this.subscriptions.dispose();
    },
    config: {
        f5_command: {
            title: 'Command of F5',
            description: '`{file}` = `{dir}/{name}{ext}`',
            type: 'string',
            default: 'python {file}',
        },
        f6_command: {
            title: 'Command of F6',
            description: 'Same as above',
            type: 'string',
            default: 'python {file}',
        },
        // NOTE: I suppose most of the users don't want to see these
        //       notifications, this is experimental removal in v1.0.0
        //       -- Infinity
        //
        // disable_notifications: {
        //     title: 'Disable success notifications',
        //     description: 'Disable notifications while saving and running',
        //     type: 'boolean',
        //     default: false
        // },
        // disable_notifications_on_fail: {
        //     title: 'Disable failure notifications',
        //     description: 'Disable notifications when extension name does not match',
        //     type: 'boolean',
        //     default: false
        // },
        extension_filter: {
            title: 'Extension filter',
            description: 'Leave it empty it accepts all files, or you can try `.py`',
            type: 'array',
            items: {
                type: 'string',
            },
            default: [],
        },
    },
    subscriptions: null,
};

function run_f5() {
    run(atom.config.get('atom-python-run.f5_command'));
}

function run_f6() {
    run(atom.config.get('atom-python-run.f6_command'));
}

function run(command) {
    let editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    let file = editor.buffer.file;
    if (!file) {
        atom.notifications.add('warning', 'You have to create the file first.');
        return;
    }
    // information('Saving...');
    editor.save();
    let info = path.parse(file.path);
    let filter = atom.config.get('atom-python-run.extension_filter');
    if (filter.length && !filter.includes(info.ext)) {
        return;
    }
    // information(`Running ${info.base} ...`);
    var cmds = command.split(' ');
    cmds.forEach((k, i, a) => {
        a[i] = k.format({
            'file': file.path,
            'dir': info.dir,
            'name': info.name,
            'ext': info.ext,
        });
    });
    let log = true;
    let options = {
        cwd: info.dir,
        detached: true,
    };
    cmds = [log, options, ...cmds];
    let tty = terminal.type.spawns_tty(...cmds);
    tty.unref();
}

// function information(message) {
//     if (!atom.config.get('atom-python-run.disable_notifications')) {
//         atom.notifications.add('info', String(message));
//     }
// }

String.prototype.format = function(array) {
    return this.replace(/{.*?}/g, k => array[k.substring(1, k.length - 1)]);
};
