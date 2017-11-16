"""parser - handles arbitrary arguments to be executed."""
#
# NOTE: 2to3 and 3to2 Compatability
# importing should consider 2to3 and 3to2 implications.
#
# https://stackoverflow.com/questions/85451/python-time-clock-vs-time-time-accuracy#85533
# https://docs.python.org/3/library/time.html#time.time
# https://docs.python.org/2.7/library/time.html#time.clock
# https://docs.python.org/2/library/timeit.html
# https://docs.python.org/2/library/sys.html#sys.platform
# https://docs.python.org/2/library/string.html#formatstrings
# https://docs.python.org/3.6/howto/argparse.html
# https://docs.python.org/3.6/library/argparse.html
#
from __future__ import absolute_import
from __future__ import print_function
from os import system, environ
from os.path import isdir, dirname
from subprocess import call
from time import time
from sys import platform
import argparse
import logging


__all__ = ("Parser",)


class Base(object):
    def __init__(self):
        self._parser = None
        self._lexer = None
        self._namespace = dict()
        self._command = list()
        self._logPath = str()
        self._exitCode = None
        self._clock = None

    def setLexer(self, *args, **kwargs):
        self._parser = argparse.ArgumentParser(**kwargs)
        self._parser.add_argument('-f', '--file', help="pipes 'stdout' and 'stderr' to the given file")
        self._parser.add_argument('-p', '--pause', action='store_true', default=False, help="prompt client for 'stdin'")
        self._parser.add_argument('repl', help="the interpreter used to execute 'args'")
        self._parser.add_argument('args', nargs='+', help="the arugments that are passed to 'repl'")
        self._lexer = self._parser.parse_args(*args[1:])

    def getLexer(self):
        return self._lexer

    def setNamespace(self):
        self._namespace = vars(self._lexer)

    def getNamespace(self):
        return self._namespace


class Logpath(Base):
    def logLogPath(self):
        logging.debug('Log Path: %s', self._logPath)

    def hasLogPath(self):
        return isdir(dirname(self._logPath))

    def defaultLogPath(self):
        if 'win32' == platform:
            return "{}\\.atom\\packages\\atom-python-run\\cp.log".format(environ['USERPROFILE'])
        return "{}/.atom/packages/atom-python-run/cp.log".format(environ['HOME'])

    def setLogPath(self, path=None):
        if path is None:
            self._logPath = self.defaultLogPath()
        else:
            self._logPath = path

    def getLogPath(self):
        if not self.hasLogPath():
            self._logPath = "cp.log"
        return self._logPath


class Clock(Base):
    def getClock(self):
        return self._clock

    def logClock(self):
        logging.info('return code: %d (0x%x)', self._exitCode, self._exitCode)
        logging.info('elapsed time: %.6f', self._clock)

    def printClock(self):
        print("\nProcess returned {:d} (0x{:x})".format(
            self._exitCode, self._exitCode), end="\t")
        print("execution time : {:.3f} s".format(self._clock))


class Command(Base):
    def _setRepl(self):
        self._command.append(self._namespace['repl'])

    def _setArgs(self):
        for arg in self._namespace['args']:
            self._command.append(arg)

    def _logCommand(self):
        logging.debug('command: %s', self._command)

    def _logNamespace(self):
        for key, value in self._namespace.items():
            logging.debug('%s: %s', key, value)

    def setCommand(self):
        self._setRepl()
        self._setArgs()
        self._logCommand()
        self._logNamespace()

    def getCommand(self):
        return self._command


class Call(Base):
    def pipeCall(self, mode='a'):
        with open(self._namespace['file'], mode) as stream:
            self._clock = time()
            self._exitCode = call(self._command, stdout=stream, stderr=stream)
            self._clock = time() - self._clock
            f.close()

    def call(self):
        self._clock = time()
        self._exitCode = call(self._command)
        self._clock = time() - self._clock

    def exitCode(self):
        return self._exitCode


class Parser(Command, Call, Clock, Logpath):
    def pause(self):
        if 'win32' == platform:
            system('pause')
        elif 'darwin' == platform:
            system('echo "Close this window to continue..."')
        elif 'linux' == platform[:5]:
            system("printf 'Press [ENTER] to continue...'; read _;")
        else:
            logging.info('Unknown OS Type: %s', platform)
