#
# NOTE: 2to3 and 3to2 Compatability
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
# clock()s value depends on the CPU, Arch type, OS, etc...
# this means the value returned by clock() is indeterminate
#
# the common averages for the given systems are
#    on win32, a microsecond or 1/1000000 of a second
#    on linux, a millisecond or 1/1000 of a second
#
# for compatability, str.format() is used instead of the print % modifier
# https://docs.python.org/2/library/string.html#formatstrings
#
# NOTE: set_logpath() issues
# if logpath becomes an issue on win32 platforms (mainly with special characters in the path),
# this may be remedied by escaping that special character.
#
# special_char = '&'
# escaped_special_char = '\&'
# logpath.split(special_char)
# escaped_special_char.join(logpath)
#
# this may be arbitrary even though the most commonly used symbol may be the ampersand (&).
# i refrained from implementing this as it may cause more issues than the one it would solve.
#
# for example, you could inadvertantly create a seperated path looking like this
# from -> c:\\Users\\User&Name
# to   -> c:\\Users\\User\\&Name
#
# using pythons raw strings may be a work around to this issue, but thats for another time
#
# NOTE: Determine platform Type
#   https://docs.python.org/2/library/sys.html#sys.platform
#
from os import system, environ
from os.path import isdir, dirname
from subprocess import call
from sys import platform
import logging
from parse import Parser


try:
    from time import process_time as clock
except ImportError:
    # deprecated as of v3.3
    from time import clock


__all__ = (
    'set_log_path', 'set_namespace', 'set_command',
    'set_clock', 'print_clock',
    'pause'
)


version_info = "v0.0.10"


def set_log_path():
    if 'win32' == platform:
        log = "{}\\.atom\\packages\\atom-python-run\\cp.log".format(environ['USERPROFILE'])
    else:
        log = "{}/.atom/packages/atom-python-run/cp.log".format(environ['HOME'])
    path = dirname(log)
    if not isdir(path):
        return "cp.log"
    return log


def set_namespace(args):
    parser = Parser(args)
    parser.check_args(args)
    parser.parse_opts()
    parser.parse_args()
    namespace = parser.get_namespace()
    for key, value in vars(namespace).items():
        logging.debug('namespace: key "%s": value "%s"', key, value)
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
    logging.debug('command: %s', command)
    return command


def set_clock(command):
    t = clock()
    r = call(command)
    t = clock() - t
    logging.info('return code: %d, elapsed time: %.6f', r, t)
    return r, t


def print_clock(code, time):
    print(
        "\nProcess returned {:d} (0x{:x})   execution time : {:.3f} s".format(code, code, time)
    )


def pause():
    if 'win32' == platform:
        system('pause')
    elif 'darwin' == platform:
        system('echo "Close this window to continue..."')
    elif 'linux' == platform[:-1]:
        system("printf 'Press [ENTER] to continue...'; read _;")
    else:
        logging.info('Unknown OS Type: %s', platform)
