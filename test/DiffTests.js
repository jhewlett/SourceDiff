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

    assertEquals({added: [{line: 0, text: 'added text'}], deleted: []}, result);
});

test("Deleting last line", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff('test\ndelete me', 'test');

    assertEquals({added: [], deleted: [{line: 1, text: 'delete me'}]}, result);
});

test("Everything is a delete", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff('delete me', '');

    assertEquals({added: [], deleted: [{line: 0, text: 'delete me'}]}, result);
});

test("line diff remove and add lines", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("if (cond)\ndoSomething()\n//a func call", "if (cond)\n//a func call\n//no longer needed");

    assertEquals({added: [{line: 2, text: '//no longer needed'}], deleted: [{line: 1, text: 'doSomething()'}]}, result);
});

test("line diff simple delete first line", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("first line\nsecond line", "second line");

    assertEquals({added: [], deleted: [{line: 0, text: 'first line'}]}, result);
});

test("line add and delete", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("if (cond)\ndoSomething()", "//no check needed\ndoNothing()");

    assertEquals({added: [{line: 0, text: '//no check needed'}, {line: 1, text: 'doNothing()'}],
        deleted: [{line: 0, text: 'if (cond)'}, {line: 1, text: 'doSomething()'}]}, result);
});

test("add line at top", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("doSomething()", "if (cond)\ndoSomething()");

    assertEquals({added: [{line: 0, text: 'if (cond)'}], deleted: []}, result);
});

test("trailing whitespace is ignored", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff("line\t", "line     \t  ");

    assertEquals({added: [], deleted: []}, result);
});

test("leading whitespace is not ignored", function() {
    var diff = new SourceDiff.Diff(false);
    var result = diff.diff('line', ' line');

    assertEquals({added: [{line: 0, text: ' line'}], deleted: [{line: 0, text: 'line'}]}, result);
});

test("leading whitespace is ignored", function() {
    var diff = new SourceDiff.Diff(true);
    var result = diff.diff('  line\t', '\t \t  line     \t  ');

    assertEquals({added: [], deleted: []}, result);
});
