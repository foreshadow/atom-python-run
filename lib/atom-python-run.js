'use strict';

module.exports = {
    activate() {
        const CompositeDisposable = require('atom').CompositeDisposable;
        const path = require('path');
        const terminal = require('./terminal');

        this.subscriptions = new CompositeDisposable();

        function runF5() {
            run({ 'command': atom.config.get('atom-python-run.f5Command'),
                'pause': atom.config.get('atom-python-run.f5Pause'),
            });
        }

        function runF6() {
            run({
                'command': atom.config.get('atom-python-run.f6Command'),
                'pause': atom.config.get('atom-python-run.f6Pause'),
            });
        }

        let disposables = [
            atom.commands.add('atom-text-editor', 'Python run: run-f5', runF5),
            atom.commands.add('atom-text-editor', 'Python run: run-f6', runF6)
        ];

        function run(config) {
            let shell, spawn, tty;
            let editor = atom.workspace.getActiveTextEditor();
            let info = path.parse(editor.buffer.file.path);
            let args = config.command.split(' ');

            config = Object.assign(config, {
                'pipeFile': atom.config.get('atom-python-run.pipeFile'),
                'pipePath': atom.config.get('atom-python-run.pipePath'),
                'extensions': atom.config.get('atom-python-run.extensionFilter'),
                'log': atom.config.get('atom-python-run.log')
            });

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

            // NOTE: 'cp' should always be on!
            if (!config.pause && !config.pipeFile) {
                console.log("atom-python-run: `pause` and `pipe` options have been disabled.");
                console.log("Cowardly refusing to continue...");
                return;
            }
            if (config.pipeFile && ('' === config.pipePath || null == config.pipePath)) {
                console.log("atom-python-run: `pipe` option has been enabled, but has no file to write to.");
                console.log("Cowardly refusing to continue...");
                return;
            }

            if ('win32' === process.platform) {
                shell = new terminal.Shell(__dirname + '\\..\\cp\\main.py');
            } else {
                shell = new terminal.Shell(__dirname + '/../cp/main.py');
            }

            spawn = new terminal.SpawnWrapper(shell.object);

            tty = spawn.tty({
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

            if (null == tty) {
                console.log('atom-python-run: ExceptionError: `terminal` refused to spawn a `tty` instance');
                return;
            }

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
            description: 'The `destination` or `file` to write to',
            type: 'string',
            default: ''
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
