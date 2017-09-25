'use strict';

module.exports = {
    activate() {
        const CompositeDisposable = require('atom').CompositeDisposable;
        const path = require('path');
        const terminal = require('./terminal');

        this.subscriptions = new CompositeDisposable();

        let config = {
            'pipeFile': atom.config.get('atom-python-run.pipeFile'),
            'pipePath': atom.config.get('atom-pyhton-run.pipePath'),
            'extensions': atom.config.get('atom-python-run.extensionFilter'),
            'log': atom.config.get('atom-python-run.log')
        };

        let disposables = [
            atom.commands.add('atom-text-editor', 'Python run: run-f5', runF5),
            atom.commands.add('atom-text-editor', 'Python run: run-f6', runF6)
        ];

        function runF5() {
            run(Object.assign(config, {
                'command': atom.config.get('atom-python-run.f5Command'),
                'pause': atom.config.get('atom-python-run.f5Pause')
            }));
        }

        function runF6() {
            run(Object.assign(config, {
                'command': atom.config.get('atom-python-run.f6Command'),
                'pause': atom.config.get('atom-python-run.f6Pause')
            }));
        }

        function run(config) {
            let editor = atom.workspace.getActiveTextEditor();
            let info = path.parse(editor.buffer.file.path);
            let args = config.command.split(' ');
            let shell = new terminal.Shell(__dirname + '/../cp/main.py');
            let spawn = new terminal.SpawnWrapper(shell.object);

            function format(string, object) {
                return string.replace(/{.*?}/g, (element) =>
                    object[element.substring(1, element.length - 1)]
                );
            }

            editor.save();

            args.forEach((item, index, arr) => {
                arr[index] = format(item, {
                    'file': editor.buffer.file.path,
                    'dir': info.dir,
                    'name': info.name,
                    'ext': info.ext,
                });
            });

            if (config.extensions.length && !config.extensions.includes(info.ext)) {
                return;
            }

            /*
                NOTE: 'cp' should always be on!
                `cp` should ALWAYS default to pausing. when `cp` is set to NOT pause,
                it should default to writing stdout and stderr to a file instead.
                this will always force the argument tokens to be checked.
            */
            if (!config.pause && !config.pipeFile) {
                console.log("atom-python-run: Exception: 'cp' has been completely disabled!");
                console.log("Cowardly refusing to continue...");
                return;
            }

            let tty = spawn.tty({
                'pause': config.pause,
                'pipeFile': config.pipeFile,
                'pipePath': config.pipePath,
                'log': config.log,
                'args': args,
                'options': {
                    cwd: info.dir,
                    detached: true
                }
            });

            tty.unref();
        }

        this.subscriptions.add(...disposables);
    },
    deactivate() {
        this.subscriptions.dispose();
    },
    config: {
        f5Command: {
            title: 'F5 Command',
            description: '`{file}` = `{dir}/{name}{ext}`',
            type: 'string',
            default: 'python {file}'
        },
        f6Command: {
            title: 'F6 Command',
            description: 'Same as above',
            type: 'string',
            default: 'python {file}'
        },
        pipePath: {
            title: 'Pipe to file',
            description: 'Note: There is no default `{path}`; It is a dummy value',
            type: 'string',
            default: '{path}'
        },
        extensionFilter: {
            title: 'Extension filter',
            description: 'Leave it empty it accepts all files, or you can try `.py`',
            type: 'array',
            items: {
                type: 'string',
            },
            default: []
        },
        pipeFile: {
                title: 'Pipe to File',
                description: 'Pipe `cp`s output to a file',
                type: 'boolean',
                default: false
        },
        f5Pause: {
            title: 'Pause (F5)',
            description: 'Show elapsed time and pause `cp`',
            type: 'boolean',
            default: true
        },
        f6Pause: {
            title: 'Pause (F6)',
            description: 'Show elapsed time and pause `cp`',
            type: 'boolean',
            default: true
        },
        log: {
            title: 'Console Log',
            description: 'Output log to `atom`s built-in console (`Note: Slow`)',
            type: 'boolean',
            default: true
        }
    },
    subscriptions: null
};
