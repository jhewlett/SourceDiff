module('main');

test("Trim trims any common prefixes", function() {
    var arr1 = ['cat', 'in', 'the', 'hat'];
    var arr2 = ['cat', 'in', 'the', 'bag'];

    var diff = new SourceDiff.Diff(false);

    var prefixCount = diff.trim(arr1, arr2);

    assertEquals(3, prefixCount);
    assertEquals(["hat"], arr1);
    assertEquals(["bag"], arr2);
});

test("Trim handles identical input", function() {
    var arr1 = ['cat'];
    var arr2 = ['cat'];

    var diff = new SourceDiff.Diff(false);
    diff.trim(arr1, arr2);

    assertEquals([], arr1);
    assertEquals([], arr2);
});

test("Trim handles common suffixes", function() {
    var arr1 = ['dancing', 'in', 'the', 'rain'];
    var arr2 = ['singing', 'in', 'the', 'rain'];

    var diff = new SourceDiff.Diff(false);
    diff.trim(arr1, arr2);

    assertEquals(["dancing"], arr1);
    assertEquals(["singing"], arr2);
});

test("everything is an add", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff('', 'added text');

    assertEquals([0], result.added.all());
    assertEquals([], result.deleted.all());
});

test("Deleting last line", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff('test\ndelete me', 'test');

    assertEquals([], result.added.all());
    assertEquals([1], result.deleted.all());
});

test("Everything is a delete", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff('delete me', '');

    assertEquals([], result.added.all());
    assertEquals([0], result.deleted.all());
});

test("line diff remove and add lines", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("if (cond)\ndoSomething()\n//a func call", "if (cond)\n//a func call\n//no longer needed");

    assertEquals([2], result.added.all());
    assertEquals([1], result.deleted.all());
});

test("line diff simple delete first line", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("first line\nsecond line", "second line");

    assertEquals([], result.added.all());
    assertEquals([0], result.deleted.all());
});

test("line add and delete", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("if (cond)\ndoSomething()", "//no check needed\ndoNothing()");

    assertEquals([0, 1], result.added.all());
    assertEquals([0, 1], result.deleted.all());
});

test("add line at top", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("doSomething()", "if (cond)\ndoSomething()");

    assertEquals([0], result.added.all());
    assertEquals([], result.deleted.all());
});

test("trailing whitespace is ignored", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("line\t", "line     \t  ");

    assertEquals([], result.added.all());
    assertEquals([], result.deleted.all());
});

test("leading whitespace is not ignored", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff('line', ' line');

    assertEquals([0], result.added.all());
    assertEquals([0], result.deleted.all());
});

test("leading whitespace is ignored", function() {
    var diff = new SourceDiff.Diff(true);
    var result = diff.diff('  line\t', '\t \t  line     \t  ');

    assertEquals([], result.added.all());
    assertEquals([], result.deleted.all());
});

test("Inserts are shifted to line up braces", function() {
    var text1 = 'void CommonMethod()\n{\n  Common();\n}';
    var text2 = 'void CommonMethod()\n{\n  NewMethod();\n  Common();\n}\n\nvoid NewMethod()\n{\n  DoStuff();\n} ';

    var diff = new SourceDiff.Diff(false);
    var result = diff.diff(text1, text2);

    assertEquals([2, 5, 6, 7, 8, 9], result.added.all());
});

test("Inserts are not shifted if the resulting run would not start in a blank line or whitespace", function() {
    var text1 = 'void CommonMethod()\n{\n  Common();\n}';
    var text2 = 'void CommonMethod()\n{\n  NewMethod();\n  Common();\n}\nnon blank\nvoid NewMethod()\n{\n  DoStuff();\n}';

    var diff = new SourceDiff.Diff(false);
    var result = diff.diff(text1, text2);

    assertEquals([2, 4, 5, 6, 7, 8], result.added.all());
});

test("Deletes are shifted to line up braces", function() {
    var text1 = 'void CommonMethod()\n{\n  NewMethod();\n  Common();\n}\n\nvoid NewMethod()\n{\n  DoStuff();\n} ';
    var text2 = 'void CommonMethod()\n{\n  Common();\n} ';

    var diff = new SourceDiff.Diff(false);
    var result = diff.diff(text1, text2);

    assertEquals([2, 5, 6, 7, 8, 9], result.deleted.all());
});

test("Trim ignores whitespace", function() {
    var text1 = "Foo = 'hello';\n";
    var text2 = "  Foo = 'hello'; ";

    var diff = new SourceDiff.Diff(true);
    var result = diff.diff(text1, text2);

    assertEquals([], result.added.all());
    assertEquals([1], result.deleted.all());
});

test("When filling the matrix, whitespace is ignored", function() {
    var text1 = "new\r\ncommon \ncommon2  \nnew2";
    var text2 = "common\ncommon2";

    var diff = new SourceDiff.Diff(true);
    var result = diff.diff(text1, text2);

    assertEquals([], result.added.all());
    assertEquals([0,3], result.deleted.all());
});

test("character diff for line", function() {
    var diff = new SourceDiff.Diff(false);

    var results = diff.lineDiff('var test = "hello";', 'var test2 = "hell";');

    assertEquals([{position: 8, endPosition: 8}], results.added);
    assertEquals([{position: 16, endPosition: 16}], results.deleted);

});

test("line diff semantic cleanup merges adjacent edits", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('aayyyyyybb', 'cccyyyyyyddd');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 1}, {position: 8, endPosition: 9}], lineDiff.deleted);
    assertEquals([{position: 0, endPosition: 2}, {position: 9, endPosition: 11}], lineDiff.added);
    assertEquals([{leftPosition: 2, leftEndPosition: 7, rightPosition: 3, rightEndPosition: 8}], lineDiff.common);
});

test("line diff semantic cleanup removes edits that are equal to or smaller than surrounding equalities", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('ing', 'nment');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 4}], lineDiff.added);
    assertEquals([{position: 0, endPosition: 2}], lineDiff.deleted);
});

test("line diff semantic cleanup handles when there is no delete on the left", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('ng', 'inment');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 5}], lineDiff.added);
    assertEquals([{position: 0, endPosition: 1}], lineDiff.deleted);
});

test("line diff semantic cleanup handles when there is no delete on the right", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('in', 'gnment');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 5}], lineDiff.added);
    assertEquals([{position: 0, endPosition: 1}], lineDiff.deleted);
});

test("line diff semantic cleanup handles when there is no delete on the left or right", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('n', 'gnment');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 5}], lineDiff.added);
    assertEquals([{position: 0, endPosition: 0}], lineDiff.deleted);
});

test("line diff semantic cleanup handles when there is no add on the right", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('ing', 'mestn');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 4}], lineDiff.added);
    assertEquals([{position: 0, endPosition: 2}], lineDiff.deleted);
});

test("line diff semantic cleanup handles when there is no add on the left or right", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('ing', 'n');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 0}], lineDiff.added);
    assertEquals([{position: 0, endPosition: 2}], lineDiff.deleted);
});

test("line diff semantic cleanup makes multiple passes", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('Hovering', 'My government');

    lineDiff.cleanUp();

    assertEquals([{position: 0, endPosition: 12}], lineDiff.added);
    assertEquals([{position: 0, endPosition: 7}], lineDiff.deleted);
});

test("not an infinite loop", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('path = docSnapin.GetFile(filename, reallyLocked, eventId);',
        'localPath = docSnapin.GetFile(docInfo.FileName, reallyLocked, eventID);');

    lineDiff.cleanUp();
});

test("Line diff ignores trailing whitespace", function() {
    var diff = new SourceDiff.Diff(false);

    var lineDiff = diff.lineDiff('pat',
        'path    ');

    assertEquals([{position: 3, endPosition: 3}], lineDiff.added);
    assertEquals([], lineDiff.deleted);
});

test("Line diff ignores leading whitespace", function() {
    var diff = new SourceDiff.Diff(true);

    var lineDiff = diff.lineDiff('pat',
        '  path');

    assertEquals([{position: 5, endPosition: 5}], lineDiff.added);
    assertEquals([], lineDiff.deleted);
});