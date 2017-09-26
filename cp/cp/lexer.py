"""lexer - structures and tests the argv token set as an AST for parsing."""
# NOTE: use the main.py file instead if you want to execute scripts.
#
############
# lexer.py #
############
# while lexer.py is executable, it executes as a dummy file and doesn't actually
# execute anything directly. it simply demonstrates how lexer.py handles the
# "argv" variable.
#
# "argv" is a list and join could be used in conjunction to create a concatenated
# string.
#
# this string could be passed directly to command. it is up to the end user to
# make sure the command executes as intended.
#
#############
# Execution #
#############
# lexer.py is mainly designed to be an extremely lightweight check.
#
# it's rules restrict what can be passed to it while remaining flexible enough
# to be able achieve arbitrary execution.
#
# in example:
#
# this will always fail... and should always fail.
#     -> "python" is the interpreter to be executed by lexer.py
#     -> "-c" is the option to be passed to python (not lexer.py)
#     -> "string" is the command to be executed by python (not lexer.py)
#
# the point of the file check is to determine if the file actually exists; not
# to see if it is executable. we also have no intention of writing to it.
# obviously, a string is executable, but we want to execute a file; not a string.
#
#     $ python lexer.py python -c 'print("hello, world!")'
#     Error: Expected optional option argument: got "'print(hello, world!)'" instead
#
#     $ python -c "print('Hello, World!')"
#     bash: !': event not found
#
#     $ python -c 'print("hello, world!")'
#     hello, world
#
#############
# Expansion #
#############
# NOTE: the shell should handle user and variable expansion it self. user,
# variable, and glob expansion should never occur.
#
# the final argument should always be a source file that can be executed by the
# given interpreter.
#
#     $ python lexer.py node ~/documents/js/hello.js
#     ...dictionary output here...
#
###########
# Options #
###########
# NOTE: lexer.py will handle its own options as long as they are placed before
# the interpreter argument.
#
# any arguments inbetween the interpreter and the filename are considered
# options to be passed to the interpreter itself.
#
# lexer.py also handles redirection. for example, if you want to pipe stdout and
# stderr to a file, you can do this
#
#     $ python lexer.py -f out.log node ~/documents/js/hello.js
#     ...dictionary output here...
#
# for more usage information, do
#
#     $ python lexer.py -h
#     ...help output here...
#
# an example on how to use the Lexer object is demonstrated in a function named
# "main()" at the end of the file.
#
from __future__ import print_function
from __future__ import absolute_import
from sys import argv
import os.path
import logging
from .fnp import FileNamePattern


__all__ = ("Lexer", "Scanner")


class BarePhraseStructure(object):
    pass


class Namespace(object):
    def __init__(self, args, progname=None):
        self._opts = [
            '-h', '--help',
            '-p', '--pause',
            '-f', '--file'
        ]

        self._optArgs = [
            '-f', '--file'
        ]

        self._index = int()
        self._error = str()
        self._ast = args[1:]

        self._namespace = BarePhraseStructure()
        self._namespace.name = progname or args[0]
        self._namespace.pause = bool()
        self._namespace.file = bool()
        self._namespace.path = str()
        self._namespace.repl = str()
        self._namespace.options = list()
        self._namespace.script = str()
        self._namespace.last = args[-1:][0]

        try:
            self.arg = args[1:][0]
        except IndexError:
            self.usage()
            exit(1)

        self.logAst()
        self.logToken()

    # Namespace
    def getNamespace(self):
        return vars(self._namespace)

    def printNamespace(self):
        for key, value in self.getNamespace().items():
            print('{}: {}'.format(key, value))


class Log(Namespace):
    def logNamespace(self):
        for key, value in self.getNamespace().items():
            logging.debug('namespace: [key] "%s" [value] "%s"', key, value)

    def logToken(self):
        logging.debug('Index: "%s" Token: "%s"', self._index, self.arg)

    def logError(self):
        logging.error(self._error)

    def logAst(self):
        logging.debug('_ast: "%s"', self._ast)


class Error(Namespace):
    def setError(self, taxonomy, error, message=None):
        if message:
            self._error = '{}: {}: {}'.format(taxonomy, error, message)
        else:
            self._error = '{}: {}'.format(taxonomy, error)

    def getError(self):
        return self._error

    def error(self, taxonomy, error, message=None):
        self.setError(taxonomy, error, message)
        self.logError()
        print(self._error)
        exit(1)


class Token(Namespace):
    def shift(self):
        self._index += 1

    def setToken(self, error=None, message=None):
        try:
            self.arg = self._ast[self._index]
        except IndexError:
            self.error('Error', error, message)

    def shiftToken(self, error=None, message=None):
        self.shift()
        self.setToken(error, message)
        self.logToken()

    def getToken(self):
        return self.arg

    def printToken(self):
        print(self.arg)


class Help(Namespace):
    def usage(self):
        print('Usage: {} [-h] [-p] [-f [filename]] repl args [args...]'.format(self._namespace.name))

    def summary(self):
        print('{} - handles arbitrary arguments to be executed.\n'.format(self._namespace.name))
        print('Usage\n-----\n\t{} [-h] [-p] [-f [filename]] repl args [args...]'.format(self._namespace.name))
        print(
            "\n"
            "Options\n"
            "-------\n"
            "\t-h\t--help\t\tprints this help text\n"
            "\t-f\t--file\t\tpipes 'stdout' and 'stderr' to the given file\n"
            "\t-p\t--pause\t\tprompt client for 'stdin'\n"
            "\n"
            "Parameters\n"
            "----------\n"
            "\trepl\t\tthe repl used to execute 'script'\n"
            "\tscript\t\t\tthe file to be executed by 'repl'\n"
            "\n"
        )
        print('Example: {} -p -f output.log python -i source.py'.format(self._namespace.name))


class Grammar(Log, Error, Token, Help):
    def hasOption(self):
        return '-' == self.arg[0]

    def hasValidOption(self):
        return self.arg in self._opts

    def hasOptionArgument(self):
        return self.arg in self._optArgs

    def hasOptionEnd(self):
        return 1 == len(self.arg)

    def endsOptionScan(self):
        return self.hasOptionEnd() if self.hasOption() else not self.hasOption()

    def hasHelpOption(self):
        return '-h' == self.arg or '--help' == self.arg

    def hasPauseOption(self):
        return '-p' == self.arg or '--pause' == self.arg

    def hasFileOption(self):
        return '-f' == self.arg or '--file' == self.arg

    def hasScript(self):  # TOCTOU - needs a better way
        return os.path.isfile(self.arg) and os.path.isfile(self._namespace.last)

    def hasRepl(self):
        return not self.hasOption() and not self.hasScript() and self.arg

    def hasValidFileName(self):
        fnp = FileNamePattern(self.arg)
        return fnp.hasFileName()

    def _setHelpOption(self):
        if self.hasHelpOption():
            self.summary()
            exit(0)

    def _setPauseOption(self):
        if self.hasPauseOption():
            self._namespace.pause = True

    def _setFileOption(self):
        if self.hasFileOption():
            self._namespace.file = True

    def _setFilePath(self):
        if self.hasOptionArgument():
            self.shiftToken('Missing required file path for option "{}"'.format(self.arg))
            self._exitOnInvalidFilename()
            self._namespace.path = self.arg

    def _setScannedOption(self):
        if self.hasValidOption():
            self._setHelpOption()
            self._setPauseOption()
            self._setFileOption()
            self._setFilePath()
            self.shiftToken(
                'Expected required repl argument',
                'got "{}" instead'.format(self.arg)
            )

    def _exitOnInvalidFilename(self):
        if not self.hasValidFileName():
            self.error(
                'Error',
                'Expected required option argument "filename"',
                'got "{}" instead'.format(self.arg)
            )

    def _exitOnInvalidOption(self):
        if not self.hasValidOption():
            self.error(
                'Error',
                'Expected optional argument "option"',
                'got "{}" instead'.format(self.arg)
            )

    def _exitOnInvalidRepl(self):
        if not self.hasRepl():
            self.error(
                'Error',
                'Expected required argument "repl"',
                'got "{}" instead'.format(self.arg)
            )

    def _exitOnMissingScript(self):
        if not self.hasScript():
            self.error(
                'Error',
                'Expected required argument "script"',
                'got "{}" instead'.format(self.arg)
            )


class Scanner(Grammar):
    def scanOptions(self):
        while not self.endsOptionScan():
            self._exitOnInvalidOption()
            self._setScannedOption()

    def scanRepl(self):
        self._exitOnInvalidRepl()
        self._namespace.repl = self.arg
        self.shiftToken(
            'Expected required script argument',
            'got "{}" instead'.format(self.arg)
        )

    def scanArguments(self):
        while not self.hasScript():
            self._namespace.options.append(self.arg)
            self.shiftToken(
                'Expected optional option argument',
                'got "{}" instead'.format(self.arg)
            )

    def scanScript(self):
        self._exitOnMissingScript()
        self._namespace.script = self.arg

    def scan(self):
        self.scanOptions()
        self.scanRepl()
        self.scanArguments()
        self.scanScript()


class Lexer(Scanner):
    pass


def main(ast):
    lexer = Lexer(ast)
    lexer.scan()
    lexer.logNamespace()
    lexer.printNamespace()


if __name__ == '__main__':
    logging.basicConfig(
        filename='testing-cp.log',
        filemode='w',
        level=logging.DEBUG,
        format='%(levelname)s: %(message)s'
    )

    main(argv)
