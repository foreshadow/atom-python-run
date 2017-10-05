
from sys import platform
from os import system

def clear():
    if 'win32' == platform:
        system('cls')
    else:
        system('clear')
