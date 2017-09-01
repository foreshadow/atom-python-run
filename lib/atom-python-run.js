'use strict';

const CompositeDisposable = require('atom').CompositeDisposable;
const path = require('path');
const terminal = require('./terminal');


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
        extension_filter: {
            title: 'Extension filter',
            description: 'Leave it empty it accepts all files, or you can try `.py`',
            type: 'array',
            items: {
                type: 'string',
            },
            default: [],
        },
        f5_no_cp: {
            title: 'Exit immediately when program ends (F5)',
            description: 'Don\'t show time elasped and don\'t pause.',
            type: 'boolean',
            default: false,
        },
        f6_no_cp: {
            title: 'Exit immediately when program ends (F6)',
            description: 'Don\'t show time elasped and don\'t pause.',
            type: 'boolean',
            default: false,
        },
    },
    subscriptions: null,
};

function run_f5() {
    run(atom.config.get('atom-python-run.f5_command'),
        atom.config.get('atom-python-run.f5_no_cp'));
}

function run_f6() {
    run(atom.config.get('atom-python-run.f6_command'),
        atom.config.get('atom-python-run.f6_no_cp'));
}

function run(command, cp) {
    let editor = atom.workspace.getActiveTextEditor();
    let file = editor.buffer.file;
    let info = path.parse(file.path);
    let extensions = atom.config.get('atom-python-run.extension_filter');
    let args = command.split(' ');
    let shell = new terminal.Shell();
    let spawn = new terminal.SpawnWrapper(shell.object);

    function invalid(extensions) {
        if (extensions.length && !extensions.includes(info.ext)) {
            return true;
        }
        return false;
    }

    function parse(array) {
        function format(string, object) {
            return string.replace(/{.*?}/g, element => object[element.substring(1, element.length - 1)]);
        }
        array.forEach((item, index, arr) => {
            arr[index] = format(item, {
                'file': file.path,
                'dir': info.dir,
                'name': info.name,
                'ext': info.ext,
            });
        });
    }

    editor.save();

    if (invalid(extensions)) {
        return;
    }

    parse(args);

    let tty = spawn.tty({
        'log': true,
        'options': {
            cwd: info.dir,
            detached: true
        },
        'cp': cp,
        'args': [...args]
    });

    tty.unref();
}

// String.prototype.format = function(object) {
//     return this.replace(/{.*?}/g, element => object[element.substring(1, element.length - 1)]);
// };
