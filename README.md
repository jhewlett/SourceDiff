SourceDiff
==========

SourceDiff uses client-side javascript to generate a side-by-side diff of two text files. Line insertions, deletions, and modifications are indicated, each in a different color.

Here is an example diff for a css file:

<img src="diffExample.png">

Notice that insertions show up on the right side in green. Deletions show up on the left side in red. Finally, modifications show up on both sides in yellow. Gray lines are used as padding to line up the text.

Each side has its own set of scrollbars, but scrolling one will scroll the other in sync.

Future enhancements:
+ Syntax highlighting
+ Character differences for modified lines
