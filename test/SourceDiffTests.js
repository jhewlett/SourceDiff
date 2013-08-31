module('main');

test("Trim trims any common prefixes", function() {
    var arr1 = ['cat', 'in', 'the', 'hat'];
    var arr2 = ['cat', 'in', 'the', 'bag'];
    var prefixCount = trim(arr1, arr2);

    assertEquals(3, prefixCount);
    assertEquals(["hat"], arr1);
    assertEquals(["bag"], arr2);
});

test("Trim handles identical input", function() {
    var arr1 = ['cat'];
    var arr2 = ['cat'];

    trim(arr1, arr2);

    assertEquals([], arr1);
    assertEquals([], arr2);
});

test("Trim handles common suffixes", function() {
    var arr1 = ['dancing', 'in', 'the', 'rain'];
    var arr2 = ['singing', 'in', 'the', 'rain'];

    trim(arr1, arr2);

    assertEquals(["dancing"], arr1);
    assertEquals(["singing"], arr2);
});

test("everything is an add", function() {
    var result = diff('', 'added text');

    assertEquals({added: [{line: 0, text: 'added text'}], deleted: []}, result);
});

test("Deleting last line", function() {
    var result = diff('test\ndelete me', 'test');

    assertEquals({added: [], deleted: [{line: 1, text: 'delete me'}]}, result);
});

test("Everything is a delete", function() {
    var result = diff('delete me', '');

    assertEquals({added: [], deleted: [{line: 0, text: 'delete me'}]}, result);
});

test("line diff remove and add lines", function() {
    var result = diff("if (cond)\ndoSomething()\n//a func call", "if (cond)\n//a func call\n//no longer needed");

    assertEquals({added: [{line: 2, text: '//no longer needed'}], deleted: [{line: 1, text: 'doSomething()'}]}, result);
});

test("line diff simple delete first line", function() {
    var result = diff("first line\nsecond line", "second line");

    assertEquals({added: [], deleted: [{line: 0, text: 'first line'}]}, result);
});

test("line add and delete", function() {
    var result = diff("if (cond)\ndoSomething()", "//no check needed\ndoNothing()");

    assertEquals({added: [{line: 0, text: '//no check needed'}, {line: 1, text: 'doNothing()'}],
        deleted: [{line: 0, text: 'if (cond)'}, {line: 1, text: 'doSomething()'}]}, result);
});

test("add line at top", function() {
    var result = diff("doSomething()", "if (cond)\ndoSomething()");

    assertEquals({added: [{line: 0, text: 'if (cond)'}], deleted: []}, result);
});

module('lining up text');

test("add empty line for delete", function() {
    var text1 = 'delete\ncommon';
    var text2 = 'common';

    var result = diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
    assertEquals('', lines[1][0]);
    assertEquals('common', lines[1][1]);
});

test("add and a delete on the same line does not add extra line", function() {
    var text1 = 'delete\ncommon';
    var text2 = 'insert\ncommon';

    var result = diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
});

test("insert adds an extra line to the left", function() {
    var text1 = 'common';
    var text2 = 'insert\ncommon';

    var result = diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(2, lines[0].length);
    assertEquals(2, lines[1].length);
    assertEquals('', lines[0][0]);
    assertEquals('common', lines[0][1]);
});

test("one delete, two inserts, adds line to left", function() {
    var text1 = 'delete\ncommon';
    var text2 = 'insert1\ninsert2\ncommon';

    var result = diff(text1, text2);

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

    var result = diff(text1, text2);

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

    var result = diff(text1, text2);

    var lines = lineUpText(text1, text2, result);

    assertEquals(4, lines[0].length);
    assertEquals(4, lines[1].length);
    assertEquals('insert1', lines[1][0]);
    assertEquals('insert2', lines[1][1]);
    assertEquals('', lines[1][2]);
    assertEquals('common', lines[1][3]);
});