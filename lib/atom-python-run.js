'use strict';

module.exports = {
    activate() {
        const CompositeDisposable = require('atom').CompositeDisposable;
        const path = require('path');
        const terminal = require('./terminal');

        this.subscriptions = new CompositeDisposable();

        let disposables = [
            atom.commands.add('atom-text-editor', 'Python run: run-f5', saveAndRun.bind(this, 'f5')),
            atom.commands.add('atom-text-editor', 'Python run: run-f6', saveAndRun.bind(this, 'f6')),
        ];

        function saveAndRun(key) {
            try {
                console.log(`${key} pressed`);
                // save() returns a promise
                let save = atom.workspace.getActiveTextEditor().save();
                if (save) {
                    // Atom expects that promise to be resolved or rejected
                    return save.then(() => {
                        run({
                            'command': atom.config.get(`atom-python-run.${key}Command`),
                            'pause': atom.config.get(`atom-python-run.${key}Pause`),
                        });
                    });
                } else { // editor.save() will be sync and returns null on atom v1.18 and older
                    run({
                        'command': atom.config.get(`atom-python-run.${key}Command`),
                        'pause': atom.config.get(`atom-python-run.${key}Pause`),
                    });
                }
            } catch(error) {
                // the promise failed and the exception was caught
                console.log(`atom-python-run: saveAndRun: ${error}`);
                atom.notifications.addError(`atom-python-run: \`${error}\`.`);
                // nothing to do, so we return undefined here
                return;
            }
        }

        function run(config) {
            let shell, spawn, tty;
            let editor = atom.workspace.getActiveTextEditor();
            let info = path.parse(editor.buffer.file.path);
            let args = config.command.split(' ');

            // load configuration settings in to 'config' object

            config = Object.assign(config, {
                'terminal': atom.config.get('atom-python-run.terminal'),
                'pipeFile': atom.config.get('atom-python-run.pipeFile'),
                'pipePath': atom.config.get('atom-python-run.pipePath'),
                'extensions': atom.config.get('atom-python-run.extensionFilter'),
                'consoleLog': atom.config.get('atom-python-run.consoleLog'),
                'f5envVariables': atom.config.get('atom-python-run.f5envVariables') // Environment Variables
            });

            let tmpEnv = {};
            var tmpArr = []

            // Extracting the env Variables from array format

            for (var i = 0; i < config.f5envVariables.length; i++) {
              if(config.f5envVariables[i].includes(":")){
                tmpArr = config.f5envVariables[i].split(":")
                if(tmpArr.length==2){
                  tmpEnv[tmpArr[0]] = tmpArr[1];
                }
              }
            }

            // console.log(tmpEnv);

            function format(string, object) {
                return string.replace(/{.*?}/g, (element) =>
                    object[element.substring(1, element.length - 1)]
                );
            }

            args.forEach((item, index, arr) => {
                arr[index] = format(item, {
                    'file': editor.buffer.file.path,
                    'dir': info.dir,
                    'name': info.name,
                    'ext': info.ext,
                });
            });

            if (2 > args.length) {
                atom.notifications.addError(`atom-python-run: \`FnKeyError\`: Invalid argument length for \`Fn-Key Command\`: requires \`repl [options] {file}\` formatting. Got \`${config.command}\` instead.`);
                return;
            }

            if (config.extensions.length && !config.extensions.includes(info.ext)) {
                atom.notifications.addError(`atom-python-run: \`ExtensionsError\`: \`extensions\` option has been enabled, but only \`${config.extensions}\` are allowed. Cowardly refusing to continue...`);
                return;
            }

            if (config.pipeFile && ('' === config.pipePath || null == config.pipePath)) {
                atom.notifications.addError(`atom-python-run: \`PipeError\`: \`pipe\` option has been enabled, but has no \`file\` to write to. Cowardly refusing to continue...`);
                return;
            }

            if ('win32' === process.platform) {
                shell = new terminal.Shell(__dirname + '\\..\\cp\\main.py');
            } else {
                shell = new terminal.Shell(__dirname + '/../cp/main.py');
            }

            spawn = new terminal.SpawnWrapper(shell.object);

            // set up a user defined 'shell'
            if (2 <= config.terminal.length) {
                // requires a 'shell' name and at least one 'option'
                if (config.terminal[0] != null && config.terminal[1] != null) {
                    spawn.object.shell = config.terminal[0];
                    // more than one option may be required depending on the system
                    spawn.object.option = [];
                    for (let option of config.terminal) {
                        if (option === config.terminal[0]) {
                            continue;
                        }
                        spawn.object.option.push(option);
                    }
                }
            }

            tty = spawn.tty({
                'pause': config.pause,
                'pipeFile': config.pipeFile,
                'pipePath': config.pipePath,
                'log': config.consoleLog,
                'args': args,
                'options': {
                    cwd: info.dir,
                    detached: true,
                    env: tmpEnv // Passing Environment variables to the shell instance
                }
            });

            try {
                tty.on('error', function (error) {
                  atom.notifications.addError(`atom-python-run: \`TerminalError\`: There was a problem opening \`${spawn.object.shell}\`. If your computer doesn't have \`${spawn.object.shell}\` installed, you can set your own terminal on the package's Settings.`);
                });
                tty.unref();
            } catch(e) {
                atom.notifications.addError(`atom-python-run: \`ExceptionError\`: \`terminal\` refused to spawn a \`tty\` instance: \`${e}\``);
                return;
            }
        }

        this.subscriptions.add(...disposables);
    },
    deactivate() {
        this.subscriptions.dispose();
    },
    config: {
        consoleLog: {
            title: 'Console Log',
            description: 'Output log to `atom`s built-in console (`Slow`)',
            type: 'boolean',
            default: true
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
        f5Command: {
            title: 'F5 Command',
            description: '`{file}` = `{dir}/{name}{ext}`',
            type: 'string',
            default: 'python {file}'
        },
        /////// Env Variables option
        f5envVariables: {
            title: 'Environment Variables',
            description: 'format [key:pair, key:pair ...]',
            type: 'array',
            default: [],
            items:{
              type: "string"
            }
        },
        f6Command: {
            title: 'F6 Command',
            description: 'Same as above',
            type: 'string',
            default: 'python {file}'
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
        pipeFile: {
                title: 'Pipe to File',
                description: 'Pipe `cp`s output to a file',
                type: 'boolean',
                default: false
        },
        pipePath: {
            title: 'Pipe to file',
            description: 'The `destination` or `file` to write to',
            type: 'string',
            default: ''
        },
        terminal: {
            title: 'Terminal',
            description: 'Leave it empty to use default `shell`, `option`; or you can try `terminator`, `-x`',
            type: 'array',
            items: {
                type: 'string',
            },
            default: []
        }
    },
    subscriptions: null
};
