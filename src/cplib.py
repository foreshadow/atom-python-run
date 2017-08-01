#
# NOTE:
# importing should consider 2to3 and 3to2 implications.
#
# for both backwards and forwards compatability, print_function and clock
# are imported to prevent incompatability issues that may arrise.
#
# clock() is deprecated in python >= 3.3
# process_time has not been ported back to 2.x
# source: https://stackoverflow.com/questions/85451/python-time-clock-vs-time-time-accuracy#85533
#
# for all intents and purposes, clock functions very much the same as it does
# in both C and C++
# source: https://docs.python.org/2.7/library/time.html#time.clock
#
# to avoid naming conflicts, process_time is imported as clock for 3.3 onwards
#
# for measuring snippets and algorithms, the built-in timeit module should be used instead
# source: https://docs.python.org/2/library/timeit.html
#
from os import system
from sys import platform
import logging
from parse import Parser

# clock()s value depends on the CPU, Arch type, OS, etc...
# this means the value returned by clock() is indeterminate
# the common averages for the given systems are
# on win32, a microsecond or 1/1000000 of a second
# on linux, a millisecond or 1/1000 of a second
try:
    from time import process_time as clock
except ImportError:
    # deprecated as of v3.3
    from time import clock


__all__ = ('log_os_type', 'set_namespace', 'set_command', 'set_clock', 'pause')


def log_os_type():
    message = 'OS Type: {}'.format(platform)
    logging.info(message)


def set_namespace(args):
    parser = Parser(args)
    parser.check_args(args)
    parser.parse_opts()
    parser.parse_args()
    namespace = parser.get_namespace()
    for key, value in vars(namespace):
        message = 'namespace: key "{}": value "{}"'.format(key, value)
        logging.debug(message)
    return namespace


def set_command(namespace):
    command = list()
    command.append(namespace.interpreter)
    for opt in namespace.options:
        command.append(opt)
    command.append(namespace.script)
    if namespace.pipe:
        command.append(namespace.pipe_symbol)
        command.append(namespace.pipe_file)
    command = ' '.join(command)
    message = 'command: {}'.format(command)
    logging.debug(message)
    return command


def set_clock(command):
    t = clock()
    r = system(command)
    t = clock() - t
    return r, t


def pause():
    if 'win32' == platform:
        system('pause')
    elif 'darwin' == platform:
        system('echo "Close this window to continue..."')
    elif 'linux' == platform:
        system("printf 'Press [ENTER] to continue...'; read _;")
    else:
        message = 'Unknown OS Type: {}'.format(platform)
        logging.info(message)
