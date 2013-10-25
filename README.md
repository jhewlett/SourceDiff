SourceDiff
==========

SourceDiff uses javascript to generate a side-by-side diff of two text files. Line insertions, deletions, and modifications are indicated, each in a different color.

Here is an example diff for a css file:

<img src="diffExample.png">

Notice that insertions show up on the right side in green. Deletions show up on the left side in red. Finally, modifications show up on both sides in yellow. The exact changes are highlighted in light yellow. Gray lines are used as padding to line up the text.

Each side has its own set of scrollbars, but scrolling one will scroll the other in sync.

Using SourceDiff in the browser
=========
The file `diff.html` shows one example of how you can use SourceDiff in the browser. This file just has text areas where the original and edited files can be copied and pasted. Alternatively, the content could come from your web server.

Using SourceDiff on your desktop
=========
There are also deployment files to package up SourceDiff as an Adobe Air package. This provides a command-line interface to use the program on your desktop. This is especially useful for setting up SourceDiff as a diff tool in git, for example. You can also download the Air package in the release section.

Command Line Arguments
----------------
The first argument is the path to the original file. The second argument is the path to the edited file. Paths may be either absolute or relative to the executing directory. Files are expected to have a UTF-8 encoding.

Creating the Air Package
----------------
To create the air package, download the Air SDK. `cd` into the `air` directory and run `airDeploy.bat`. When prompted, enter `sourcediff` as the password for the self-signed certificate.

Future enhancements:
+ Syntax highlighting
+ Configure to ignore or show whitespace changes
