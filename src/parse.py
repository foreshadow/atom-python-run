"""
parser - handles arbitrary arguments to be executed.

NOTE: use the main.py file instead if you want to execute scripts. while parse.py is executable,
it executes as a dummy file and doesn't actually execute anything directly. it simply demonstrates
how parse.py handles the argv variable.

argv is a list and join could be used in conjunction to create a concatenated string.

this string could be passed directly to command. it is up to the end user to make sure the
command executes as intended.

parse.py is mainly designed to be an extremely lightweight check.

it's rules restrict what can be passed to it while remaining flexible enough to be able
achieve arbitrary execution.

in example:

this will always fail... and should always fail.
    -> python is the interpreter to be executed by parse.py
    -> -c is the option to be passed to python (not parse.py)
    -> string is the command to be executed by python (not parse.py)

the point of the file check is to determine if the file actually exists before attempting to read
it; not to see if it is executable. we also have no intention of writing to it. obviously, a string
is executable, but we want to execute a file; not a string.

    $ python parse.py python -c 'print("hello, world!")'
    IOError: file does not exist: print("hello, world!")

    $ python -c "print('Hello, World!')"
    bash: !': event not found

    $ python -c 'print("hello, world!")'
    hello, world

parse.py will handle user and variable expansion. globs should never be expanded.
the final argument should always be a source file that can be executed by the given interpreter.

    $ python parse.py node ~/documents/js/hello.js
    ...dictionary output here...

parse.py will handle its own options as long as they are placed before the interpreter argument.
any arguments inbetween the interpreter and the filename are considered options to be passed to the
interpreter itself.

parse.py also handles redirection. for example, if you want to pipe stdout while appending to a
file, you can do this

    $ python parse.py -p out.log '>>' node ~/documents/js/hello.js
    ...dictionary output here...

for more usage information, use main.py

    $ python main.py -h
    ...help output here...

an example on how to use the Parser object is demonstrated at the end of the file
"""

from __future__ import print_function
from sys import argv
from os.path import isfile, expanduser, expandvars


class Namespace(object):
    pass


class SimpleHelpParser(Namespace):
    def usage(self):
        print('Usage: {} [-h] [-p [filename] [symbol]] interpreter args [args]...'.format(self._progname))

    def summary(self):
        print('{} - handles arbitrary arguments to be executed.\n'.format(self._progname))
        print('Usage\n-----\n\t{} [-h] [-p [filename] [symbol]] interpreter args [args]...'.format(self._progname))
        print(
            "\n"
            "Options\n"
            "-------\n"
            "\t-h\t--help\t\t\tprints this help text\n"
            "\t-p\t--pipe-to-file\t\tpipes stdout and stderr to the given filename\n"
            "\n"
            "Parameters\n"
            "----------\n"
            "\tinterpreter\t\tthe interpreter used to execute script\n"
            "\tscript\t\t\tthe file to be executed by interpreter\n"
            "\n"
            "Symbols\n"
            "-------\n"
            "\t>\t\ttruncate on stdout\n"
            "\t>>\t\tappend on stdout\n"
            "\t&>\t\ttruncate on stdout and stderr\n"
            "\t&\t\tsynonym for &>\n\n"
            "Symbols should always be quoted. Consequences could otherwise occur.\n"
        )
        print('Example: {} -p output.log "&" python -i source.py'.format(self._progname))


class SimpleArgParser(Namespace):
    def shift(self):
        self.index += 1

    def error(self, taxonomy, message, extendmsg=None):
        if not extendmsg:
            print('{}: {}'.format(taxonomy, message))
        else:
            print('{}: {}: {}'.format(taxonomy, message, extendmsg))
        exit(1)

    def get_arg(self, errmsg=None):
        try:
            return self.args[self.index]
        except IndexError as e:
            if errmsg:
                print('IndexError: {}: {}'.format(errmsg, e))
            else:
                print('IndexError: {}'.format(e))
            exit(1)

    def _set_interpreter(self):
        if self.namespace.pipe:
            self.shift()
        self.namespace.interpreter = self.get_arg('missing interpreter')

    def _set_options(self):
        while True:
            self.shift()
            arg = self.get_arg('missing interpreter argument')
            if arg == self.namespace.last_element:
                break
            self.namespace.options.append(arg)

    def _set_script(self):
        # last arg should always be the script!
        if not isfile(self.namespace.last_element):
            self.error('IOError', 'file does not exist', self.namespace.last_element)
        self.namespace.script = expanduser(expandvars(self.namespace.last_element))


class SimpleOptParser(Namespace):
    def isvalid(self, argument):
        if argument in self._options or argument in self._symbols:
            return True
        return False

    def _help(self, arg):
        if '-h' == arg or '--help' == arg:
            self.summary()
            exit(1)

    def _set_pipe_flag(self):
        self.namespace.pipe = True

    def _set_pipe_file(self):
        self.shift()
        self.namespace.pipe_file = self.get_arg('no file to pipe to')

    def _set_pipe_symbol(self):
        self.shift()
        self.namespace.pipe_symbol = self.get_arg('missing pipe symbol')

    def _check_pipe_symbol(self):
        if not self.isvalid(self.namespace.pipe_symbol):
            self.error('IndexError', 'invalid pipe symbol type', self._symbols)

    def _set_pipe(self, arg):
        if '-p' == arg or '--pipe-to-file' == arg:
            self._set_pipe_flag()
            self._set_pipe_file()
            self._set_pipe_symbol()
            self._check_pipe_symbol()


class Parser(SimpleHelpParser, SimpleOptParser, SimpleArgParser):
    def __init__(self, args, progname=None):
        self._options = [
            '-h', '--help',
            '-p', '--pipe-to-file'
        ]
        # &> and & are synomynous
        self._symbols = ['>', '>>', '&>', '&']
        self._progname = progname or args[0]
        self.index = int()
        self.args = args[1:]
        self.namespace = Namespace()
        self.namespace.progname = self._progname
        self.namespace.pipe = bool()
        self.namespace.pipe_symbol = '>'  # default is truncate on stdout (universal)
        self.namespace.pipe_file = None
        self.namespace.interpreter = None
        self.namespace.script = None
        self.namespace.options = list()
        self.namespace.last_element = args[-1:][0]

    def check_args(self, args):
        if not len(args) > 1:
            self.usage()
            exit(1)

    def get_namespace(self):
        return self.namespace

    def parse_opts(self):
        arg = self.get_arg()
        if self.isvalid(arg):
            self._help(arg)
            self._set_pipe(arg)

    def parse_args(self):
        self._set_interpreter()
        self._set_options()
        self._set_script()


if __name__ == '__main__':
    parser = Parser(argv)
    parser.check_args(argv)
    parser.parse_opts()
    parser.parse_args()

    namespace = vars(parser.get_namespace())

    for key, value in namespace.iteritems():
        print('{} = {}'.format(key, value))
