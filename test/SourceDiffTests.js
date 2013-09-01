module('main');

test("Trim trims any common prefixes", function() {
    var arr1 = ['cat', 'in', 'the', 'hat'];
    var arr2 = ['cat', 'in', 'the', 'bag'];

    var diff = new SourceDiff.Diff();

    var prefixCount = diff.trim(arr1, arr2);

    assertEquals(3, prefixCount);
    assertEquals(["hat"], arr1);
    assertEquals(["bag"], arr2);
});

test("Trim handles identical input", function() {
    var arr1 = ['cat'];
    var arr2 = ['cat'];

    var diff = new SourceDiff.Diff();
    diff.trim(arr1, arr2);

    assertEquals([], arr1);
    assertEquals([], arr2);
});

test("Trim handles common suffixes", function() {
    var arr1 = ['dancing', 'in', 'the', 'rain'];
    var arr2 = ['singing', 'in', 'the', 'rain'];

    var diff = new SourceDiff.Diff();
    diff.trim(arr1, arr2);

    assertEquals(["dancing"], arr1);
    assertEquals(["singing"], arr2);
});

test("everything is an add", function() {
    var diff = new SourceDiff.Diff();
    var result = diff.diff('', 'added text');

    assertEquals({added: [{line: 0, text: 'added text'}], deleted: []}, result);
});

test("Deleting last line", function() {
    var diff = new SourceDiff.Diff();
    var result = diff.diff('test\ndelete me', 'test');

    assertEquals({added: [], deleted: [{line: 1, text: 'delete me'}]}, result);
});

test("Everything is a delete", function() {
    var diff = new SourceDiff.Diff();
    var result = diff.diff('delete me', '');

    assertEquals({added: [], deleted: [{line: 0, text: 'delete me'}]}, result);
});

test("line diff remove and add lines", function() {
    var diff = new SourceDiff.Diff();
    var result = diff.diff("if (cond)\ndoSomething()\n//a func call", "if (cond)\n//a func call\n//no longer needed");

    assertEquals({added: [{line: 2, text: '//no longer needed'}], deleted: [{line: 1, text: 'doSomething()'}]}, result);
});

test("line diff simple delete first line", function() {
    var diff = new SourceDiff.Diff();
    var result = diff.diff("first line\nsecond line", "second line");

    assertEquals({added: [], deleted: [{line: 0, text: 'first line'}]}, result);
});

test("line add and delete", function() {
    var diff = new SourceDiff.Diff();
    var result = diff.diff("if (cond)\ndoSomething()", "//no check needed\ndoNothing()");

    assertEquals({added: [{line: 0, text: '//no check needed'}, {line: 1, text: 'doNothing()'}],
        deleted: [{line: 0, text: 'if (cond)'}, {line: 1, text: 'doSomething()'}]}, result);
});

test("add line at top", function() {
    var diff = new SourceDiff.Diff();
    var result = diff.diff("doSomething()", "if (cond)\ndoSomething()");

    assertEquals({added: [{line: 0, text: 'if (cond)'}], deleted: []}, result);
});

module('lining up text');

test("add empty line for delete", function() {
    var text1 = 'delete\ncommon';
    var text2 = 'common';

    var diff = new SourceDiff.Diff();
    var result = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
    assertEquals('', lines[1][0]);
    assertEquals('common', lines[1][1]);
});

test("add and a delete on the same line does not add extra line", function() {
    var text1 = 'delete\ncommon';
    var text2 = 'insert\ncommon';

    var diff = new SourceDiff.Diff();
    var result = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
});

test("insert adds an extra line to the left", function() {
    var text1 = 'common';
    var text2 = 'insert\ncommon';

    var diff = new SourceDiff.Diff();
    var result = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
    assertEquals('', lines[0][0]);
    assertEquals('common', lines[0][1]);
});

test("one delete, two inserts, adds line to left", function() {
    var text1 = 'delete\ncommon';
    var text2 = 'insert1\ninsert2\ncommon';

    var diff = new SourceDiff.Diff();
    var result = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(3, lines[0].length);
    assertEquals(3, lines[1].length);
    assertEquals('delete', lines[0][0]);
    assertEquals('', lines[0][1]);
    assertEquals('common', lines[0][2]);
});

test("three deletes, one insert, adds two lines to right", function() {
    var text1 = 'delete1\ndelete2\ndelete3\ncommon';
    var text2 = 'insert1\ncommon';

    var diff = new SourceDiff.Diff();
    var result = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(4, lines[0].length);
    assertEquals(4, lines[1].length);
    assertEquals('insert1', lines[1][0]);
    assertEquals('', lines[1][1]);
    assertEquals('', lines[1][2]);
    assertEquals('common', lines[1][3]);
});

test("three deletes, two inserts, adds one lines to right", function() {
    var text1 = 'delete1\ndelete2\ndelete3\ncommon';
    var text2 = 'insert1\ninsert2\ncommon';

    var diff = new SourceDiff.Diff();
    var result = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(4, lines[0].length);
    assertEquals(4, lines[1].length);
    assertEquals('insert1', lines[1][0]);
    assertEquals('insert2', lines[1][1]);
    assertEquals('', lines[1][2]);
    assertEquals('common', lines[1][3]);
});

test("new blank line is considered an insert", function() {
    var text1 = 'common';
    var text2 = '\ncommon';

    var diff = new SourceDiff.Diff();
    var results = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, results);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
    assertEquals('', lines[0][0]);
    assertEquals('common', lines[0][1]);
    assertEquals(' ', lines[1][0]);
    assertEquals('common', lines[1][1]);
});

test("deleted blank line is considered a delete", function() {
    var text1 = '\ncommon';
    var text2 = 'common';

    var diff = new SourceDiff.Diff();
    var results = diff.diff(text1, text2);

    var lines = lineUpText(text1, text2, results);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
    assertEquals(' ', lines[0][0]);
    assertEquals('common', lines[0][1]);
    assertEquals('', lines[1][0]);
    assertEquals('common', lines[1][1]);
});

test("lined up correctly", function() {
    var text1 = 'a\nL1';
    var text2 = 'R1\na\nR2';

    var diff = new SourceDiff.Diff();
    var results = diff.diff(text1, text2);

    assertEquals([{line: 1, text: 'L1'}], results.deleted);
    assertEquals([{line: 0, text: 'R1'}, {line: 2, text: 'R2'}], results.added);

    var lines = lineUpText(text1, text2, results);

    assertEquals(3, lines[0].length);
    assertEquals(3, lines[1].length);
    assertEquals('', lines[0][0]);
    assertEquals('a', lines[0][1]);
    assertEquals('L1', lines[0][2]);
    assertEquals('R1', lines[1][0]);
    assertEquals('a', lines[1][1]);
    assertEquals('R2', lines[1][2]);
});

test("lined up correctly 2", function() {
    var text1 = 'L\ncommon';
    var text2 = 'common\nR';

    var diff = new SourceDiff.Diff();
    var results = diff.diff(text1, text2);

    assertEquals([{line: 0, text: 'L'}], results.deleted);
    assertEquals([{line: 1, text: 'R'}], results.added);

    var lines = lineUpText(text1, text2, results);

    assertEquals(2, lines[0].length);
    assertEquals(3, lines[1].length);
    assertEquals('L', lines[0][0]);
    assertEquals('common', lines[0][1]);
    assertEquals('', lines[1][0]);
    assertEquals('common', lines[1][1]);
    assertEquals('R', lines[1][2]);
});

test("lined up correctly with two edit runs", function() {
    var text1 = 'L\ncommon\ncommon2\nL2';
    var text2 = 'common\nR\ncommon2';

    var diff = new SourceDiff.Diff();
    var results = diff.diff(text1, text2);

    assertEquals([{line: 0, text: 'L'}, {line: 3, text: 'L2'}], results.deleted);
    assertEquals([{line: 1, text: 'R'}], results.added);

    var lines = lineUpText(text1, text2, results);

    assertEquals(5, lines[0].length);
    assertEquals(4, lines[1].length);
    assertEquals('L', lines[0][0]);
    assertEquals('common', lines[0][1]);
    assertEquals('', lines[0][2]);
    assertEquals('common2', lines[0][3]);
    assertEquals('L2', lines[0][4]);
    assertEquals('', lines[1][0]);
    assertEquals('common', lines[1][1]);
    assertEquals('R', lines[1][2]);
    assertEquals('common2', lines[1][3]);
});

