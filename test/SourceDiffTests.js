module('main');

test("LCS with empty strings", function () {
    var cs = lcs("", "");

    assertEquals("", cs);
});

test("LCS with empty string", function () {
    var cs = lcs("a", "");

    assertEquals("", cs);
});

test("LCS with identical strings", function () {
    var cs = lcs("a", "a");

    assertEquals("a", cs);
});

test("LCS with cs of length 1", function () {
    var cs = lcs("a", "ab");

    assertEquals("a", cs);
});

test("LCS with abde", function () {
    var cs = lcs("abdef", "abdabde");

    assertEquals("abde", cs);
});

test("LCS with BCDG", function () {
    var cs = lcs("ABCDEFG", "BCDGK");

    assertEquals("BCDG", cs);
});

test("LCS with MJAU", function () {
    var cs = lcs("XMJYAUZ", "MZJAWXU");

    assertEquals("MJAU", cs);
});

test("Xml snippet", function () {
    var cs = lcs('<CATEGORY desc="Search Warrants Issued"><LINE>4</LINE></CATEGORY>', '<CATEGORY desc="Search Warrants"><LINE>5</LINE><NEW /></CATEGORY>');

    assertEquals('<CATEGORY desc="Search Warrants"><LINE></LINE></CATEGORY>', cs);
});

test("lcs phrase", function() {
    var common = lcs("the rain", "curse the");

    assertEquals("the", common);
});

test("Trim trims any common prefixes", function() {
    var arr1 = ['cat', 'in', 'the', 'hat'];
    var arr2 = ['cat', 'in', 'the', 'bag'];
    trim(arr1, arr2);

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

    assertEquals({added: ['added text'], deleted: []}, result);
});

test("Deleting a line", function() {
    var result = diff('test\ndelete me', 'test');

    assertEquals({added: [], deleted: ['delete me']}, result);
});

test("Everything is a delete", function() {
    var result = diff('delete me', '');

    assertEquals({added: [], deleted: ['delete me']}, result);
});

test("line diff remove and add lines", function() {
    var result = diff("if (cond)\ndoSomething()\n//a func call", "if (cond)\n//a func call\n//no longer needed");

    assertEquals({added: ['//no longer needed'], deleted: ['doSomething()']}, result);
});

test("line diff simple delete first line", function() {
    var result = diff("first line\nsecond line", "second line");

    assertEquals({added: [], deleted: ['first line']}, result);
});

test("line add and delete", function() {
    var result = diff("if (cond)\ndoSomething()", "//no check needed\ndoNothing()");

    assertEquals({added: ['//no check needed', 'doNothing()'], deleted: ['if (cond)', 'doSomething()']}, result);
});

test("line add line at top", function() {
    var result = diff("doSomething()", "if (cond)\ndoSomething()");

    assertEquals({added: ['if (cond)'], deleted: []}, result);
});