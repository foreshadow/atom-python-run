"""fnp - discern whether the given string is a valid file name and/or path."""
#
# ######
# NOTE #
########
# Some people, when confronted with a problem, think
# "I know, I'll use regular expressions."   Now they have two problems.
#
# I find nothing wrong with using regular expressions when appropriate. In the end,
# I chose "structured code" over "regex" for "precision and speed".
#
# This module seems to be the "better" choice overall for this single use case.
#
# I came to this conclusion after some time, consideration, and extensive testing.
#
# Fragile code is always bad code; sadly in this case I couldn't helped it.
# Any desired changes or fixes could impact other portions of the code.
# The major trade off seemed to be between "code complexity" and "execution speed".
# This module runs more "accurately" and "effeciently" than using a module fitted for regex.
#
# I needed a single use function for determining whether or not a given string
# could pass as a "valid" file name and/or a "valid" path to a file name.
#
# This module checks a given string and determines whether or not it is a valid file path.
# It does not (nor should it) determine a files creditablity or accessability.
#
# NOTE: The file need not exist nor be created. It should return True on any
# path considered "valid" as long as it is not pointing to a directory.
#
# ################
# Absolute Paths #
# ################
# :  ]- Current Directory --|
#                           |-- Windows Only - requires alpha prefix
# :\ ]- Root Directory    --|
#
# /  ]- Root Directory      |-- *nix Only - required prefix for absolute path
#
# ################
# Relative Paths #
# ################
# Relative paths are universal (for the most part)
#
# Windows allows a '/' or a '\' as long as a single form is used
# Unix requires a '/' and uses the '\' character as an escape character
#
# . .. ./ .\ ../ ..\ ]-- all valid relative path prefixes
#
# #################
# Path Seperators #
# #################
# whether or not any valid prefix is correct is system dependent.
# this implementation is system dependent and not all forms are considered valid.
#
# i.e.: the following command line is valid on a win32 system
# $ cd C:/Users/Username/Documents
#
# NOTE: the this will fail when this module is used because the seperator value is defined
# by the os.path.sep variable and then used to validate the given path like patterns.
#
# this module would only consider C:\Users\Username\Documents to be valid
#
from __future__ import print_function
from sys import platform
from os.path import sep, isdir
from string import ascii_letters, digits

__all__ = ('FileNamePattern', 'filenames', 'winpaths', 'nixpaths')


class Base(object):
    def __init__(self, charset=None):
        self._charset = charset
        self._sep = sep
        self._legalPathSet = [":", ":\\", "/", "./", ".\\", "../", "..\\"]
        self._legalCharSet = ascii_letters + digits + '_.'

    def getCharSet(self):
        return self._charset

    def setCharSet(self, charset):
        self._charset = charset


class Grammar(object):
    # requires exception since value is unknown
    def hasLegalPath(self, start, stop=None):
        try:
            if stop is None:
                return self._charset[start] in self._legalPathSet
            return self._charset[start:stop] in self._legalPathSet
        except IndexError:
            return False

    # requires exception since value is unknown
    def hasLegalChar(self, position):
        try:
            return self._charset[position] in self._legalCharSet
        except IndexError:
            return False

    def nextCharIsLegal(self, position):
        return self.hasLegalChar(position + 1)

    # NOTE: will always return an empty string on failure
    def endsWithPathSep(self):  # this block is here for testing purposes
        return self._charset[-1:] == self._sep

    # requires exception since value is unknown
    def startsWithChar(self):
        try:
            return self._charset[0].isalpha()
        except IndexError:
            return False

    def startsWithLegalChar(self):
        return self.hasLegalChar(0)

    def startsWithPathSep(self):
        return self.hasLegalPath(0) and self._charset[0] == self._sep

    def startsWithCurrentDir(self):
        return self.hasLegalPath(0, 2) and self._charset[0] == '.'

    def startsWithParentDir(self):
        return self.hasLegalPath(0, 3) and self._charset[0] == '.'

    def startsWithWinCurrentPath(self):
        return self.startsWithChar() and self.hasLegalPath(1) \
            and self.hasLegalChar(2)

    def startsWithWinDrivePath(self):
        return self.startsWithChar() and self.hasLegalPath(1, 3)


class Scanner(object):
    def pathIsRelative(self):
        return self.startsWithCurrentDir() or self.startsWithParentDir()

    def winAbsolutePath(self):
        return self.startsWithWinCurrentPath() or self.startsWithWinDrivePath()

    def nixAbsolutePath(self):
        return '/' == self._charset[0]

    def pathIsAbsolute(self):
        return self.winAbsolutePath() or self.nixAbsolutePath()

    def pathIsLegal(self):
        for pos, char in enumerate(self._charset):
            if (char == self._sep or self.startsWithWinCurrentPath()) and self.nextCharIsLegal(pos):
                return True
        return False

    def pathIsValid(self):
        if self.pathIsRelative() or self.pathIsAbsolute():
            return self.pathIsLegal()
        return self.startsWithLegalChar() and self.nextCharIsLegal(0)


class FileNamePattern(Base, Grammar, Scanner):
    def testHasFileName(self):
        if self.endsWithPathSep():
            return False
        return self.pathIsValid()

    def testDisplayPath(self, label, path):
        print("{}:".format(label), "{}:".format(self.testHasFileName()), path)

    def hasFileName(self):
        if isdir(self._charset):
            return False
        return self.pathIsValid()

    def displayPath(self, label, path):
        print("{}:".format(label), "{}:".format(self.hasFileName()), path)


def main():
    fnp = FileNamePattern()
    if platform == 'win32':
        pathlist = filenames + winpaths
    else:
        pathlist = filenames + nixpaths
    print("Label: Valid file name: File path")
    for p in pathlist:
        fnp.setCharSet(p)
        fnp.testDisplayPath('Path', p)


filenames = [
    "filename",
    ".filename",
    "_filename",
    "file name",
    ".file name",
    "_file name",
    "filename.ext",
    ".filename.ext",
    "_filename.ext",
    "file name.ext",
    ".file name.ext",
    "_file name.ext"
]

winpaths = [
    "\\",
    "\\.",
    "\\_",
    "\\home",
    "\\home\\",
    "\\home\\username",
    "\\home\\username\\some dir",
    "\\home\\username\\some dir\\",
    "\\home\\username\\some dir\\path",
    "home\\username\\some dir\\path",
    "home\\username\\some dir\\path/",
    ".home\\username\\some dir\\path",
    ".home\\username\\some dir\\path\\",
    "..home\\username\\some dir\\path",
    "..home\\username\\some dir\\path\\",
    "\\home\\username\\some dir\\path\\.",
    "\\home\\username\\some dir\\path\\_",
    "\\home\\username\\some dir\\path\\.filename",
    "\\home\\username\\some dir\\path\\_filename",
    "\\home\\username\\some dir\\path\\filename",
    ".",
    ".\\",
    "..\\",
    ".\\.",
    "..\\.",
    ".\\_",
    "..\\_",
    ".\\.filename",
    "..\\.filename.ext",
    ".\\_filename",
    "..\\_filename.ext",
    ".\\filename",
    "..\\filename.ext",
    ".\\Users",
    "..\\Users\\Username",
    ".\\Users\\Username\\",
    ".\\Users\\Username\\Some file",
    "..\\Users\\Username\\Some file\\",
    ".\\Users\\Username\\Some file\\path",
    "..\\Users\\Username\\Some file\\.path",
    "...\\Users\\Username\\Some file\\_path",
    "...\\Users\\Username\\Some file\\path\\filename.ext",
    "..\\Users\\Username\\Some file\\.path\\filename",
    ".\\Users\\Username\\Some file\\_path\\filename.ext",
    "C",
    "C:",
    "C:",
    "C:.",
    "C:_",
    "C:+",
    "C:Users",
    "C:Users\\Username",
    "C:Users\\Username\\",
    "C:Users\\Username\\Some file",
    "C:Users\\Username\\Some file\\",
    "C:Users\\Username\\Some file\\path",
    "C:Users\\Username\\Some file\\.path",
    "C:Users\\Username\\Some file\\_path",
    "C:Users\\Username\\Some file\\path\\filename.ext",
    "C:Users\\Username\\Some file\\.path\\filename",
    "C:Users\\Username\\Some file\\_path\\filename.ext",
    "C",
    "C:",
    "C:\\",
    "C:\\.",
    "C:\\_",
    "C:\\+",
    "C:\\Users",
    "C:\\Users\\Username",
    "C:\\Users\\Username\\",
    "C:\\Users\\Username\\Some file",
    "C:\\Users\\Username\\Some file\\",
    "C:\\Users\\Username\\Some file\\path",
    "C:\\Users\\Username\\Some file\\.path",
    "C:\\Users\\Username\\Some file\\_path",
    "C:\\Users\\Username\\Some file\\path\\filename.ext",
    "C:\\Users\\Username\\Some file\\.path\\filename",
    "C:\\Users\\Username\\Some file\\_path\\filename.ext",
]

nixpaths = [
    ".",
    "./",
    "../",
    "./.",
    "../.",
    "./_",
    "../_",
    "./.filename",
    "../.filename.ext",
    "./_filename",
    "../_filename.ext",
    "./filename",
    "../filename.ext",
    "./somedir/.filename",
    "../somedir/.filename.ext",
    "./somedir/_filename",
    "../some/dir/path and name/_filename.ext",
    "./some/dir/path and name/filename",
    "../some/dir/path and name/filename.ext",
    "/",
    "/.",
    "/_",
    "/.filename",
    "/.filename.ext",
    "/_filename",
    "/_filename.ext",
    "/home",
    "/home/",
    "/home/username",
    "/home/username/some dir",
    "/home/username/some dir/",
    "/home/username/some dir/path",
    "home/username/some dir/path",
    "home/username/some dir/path/",
    ".home/username/some dir/path",
    ".home/username/some dir/path/",
    "..home/username/some dir/path",
    "..home/username/some dir/path/",
    "/home/username/some dir/path/.",
    "/home/username/some dir/path/_",
    "/home/username/some dir/path/.filename",
    "/home/username/some dir/path/.filenameext",
    "/home/username/some dir/path/_filename",
    "/home/username/some dir/path/_filename.ext",
    "/home/username/some dir/path/filename",
    "/home/username/some dir/path/file name",
    "/home/username/some dir/path/filename.ext",
    "/home/username/some dir/path/file name.ext"
]

if __name__ == '__main__':
    main()
