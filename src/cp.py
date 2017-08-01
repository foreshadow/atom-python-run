
from __future__ import print_function
from sys import argv
import logging
import cplib


if __name__ == '__main__':
    # filemode is set to write to avoid an overly sized log file
    # if the file is truncated in such a way that is unsuitable,
    # just remove the filemode argument from the basicConfig call
    logging.basicConfig(filename='cp.log', filemode='w', level=logging.DEBUG)

    cplib.log_os_type()

    namespace = cplib.set_namespace(argv)
    command = cplib.set_command(namespace)

    code, time = cplib.set_clock(command)

    # for compatability, str.format() is used instead of the print % modifier
    # https://docs.python.org/2/library/string.html#formatstrings
    print(
        "\nProcess returned {:d} (0x{:x})\texecution time : {:.6f} s\n".format(code, code, time)
    )

    cplib.pause()

    exit(code)
