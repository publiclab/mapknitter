======================================================================

DESCRIPTION:

* NOTICE * THIS VERSION OF THE SOFTWARE IS "ALPHA," MEANING IT IS IS
NOT YET READY FOR USE IN A PRODUCTION ENVIRONEMNT. IT IS MADE
AVAILABLE FOR PREVIEW AND TESTING PURPOSES ONLY.

This is Version 2 of JsDoc Toolkit, an automatic documentation
generation tool for JavaScript. It is written in JavaScript and is run
from a command line (or terminal) using the Java runtime engine.

Using this tool you can automatically turn JavaDoc-like comments in
your JavaScript source code into published output files, such as HTML
or XML.

For more information, to report a bug, or to browse the technical
documentation for this tool please visit the official JsDoc Toolkit
project homepage at http://code.google.com/p/jsdoc-toolkit/

For the most up-to-date documentation on Version 2 of JsDoc Toolkit
see the Verion 2 wiki at http://jsdoctoolkit.org/wiki


======================================================================

USAGE:

Running JsDoc Toolkit requires you to have Java installed on your
computer. For more information see http://www.java.com/getjava/

Before running the JsDoc Toolkit app you should change your current
working directory to the jsdoc-toolkit folder. Then follow the
examples below, or as shown on the project wiki.

On a computer running Windows a valid command line to run JsDoc
Toolkit might look like this:

> java -jar jsrun.jar app\main.js -a -t=templates\jsdoc mycode.js

On Mac OS X or Linux the same command would look like this:

$ java -jar jsrun.jar app/main.js -a -t=templates/jsdoc mycode.js

The above assumes your current working directory contains jsrun.jar,
the "app" and "templates" subdirectories from the standard JsDoc
Toolkit distribution and that the relative path to the code you wish
to document is "mycode.js".

The output documentation files will be saved to a new directory named
"out" (by default) in the current directory, or if you specify a
-d=somewhere_else option, to the somewhere_else directory.

For help (usage notes) enter this on the command line:

$ java -jar jsrun.jar app/main.js --help

To run the suite of unit tests included with JsDoc Toolkit enter this
on the command line:

$ java -jar jsrun.jar app/main.js --test

More information about the various command line options used by JsDoc
Toolkit are available on the project wiki.


======================================================================

LICENSE:

This project is based on the JSDoc.pm tool, created by Michael
Mathews, maintained by Gabriel Reid. More information on JsDoc.pm can
be found on the JSDoc.pm homepage: http://jsdoc.sourceforge.net/

Complete documentation on JsDoc Toolkit can be found on the project
wiki at http://code.google.com/p/jsdoc-toolkit/w/list

Rhino (JavaScript in Java) is open source and licensed by Mozilla
under the MPL 1.1 or later/GPL 2.0 or later licenses, the text of
which is available at http://www.mozilla.org/MPL/

You can obtain the source code for Rhino via the Mozilla web site at
http://www.mozilla.org/rhino/download.html

The Tango base icon theme is licensed under the Creative Commons
Attribution Share-Alike license. The palette is in the public domain.
For more details visit the Tango! Desktop Project page at
http://tango.freedesktop.org/Tango_Desktop_Project

JsDoc Toolkit is a larger work that uses the Rhino JavaScript engine
without modification and without any claims whatsoever.

All code specific to JsDoc Toolkit are free, open-source and licensed
for use under the X11/MIT License.

JsDoc Toolkit is Copyright (c) 2007 Michael Mathews
<micmath@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions: The above copyright notice and this
permission notice must be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
