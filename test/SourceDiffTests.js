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

test("Trim trims any common prefixes", function() {
    var trimmed = trim("cat in the hat", "cat in the bag");

    assertEquals(["hat", "bag"], trimmed);
});

test("Trim handles identical input", function() {
    var trimmed = trim("cat", "cat");

    assertEquals(["", ""], trimmed);
});

test("Trim handles complete substring", function() {
    var trimmed = trim("cat", "category");

    assertEquals(["", "egory"], trimmed);
});

test("Trim handles common suffixes", function() {
    var trimmed = trim("dancing in the rain", "singing in the rain");

    assertEquals(["danc", "sing"], trimmed);
});

//test("printDiff", function() {
//    var result = diff("the rain", "curse the");
//
//    assertEquals({added: 'curse ', deleted: ' rain'}, result);
//});

test("diff with added suffix", function() {
    var result = diff("cat", "category");

    assertEquals({added: 'egory', deleted: ''}, result);
});

test("everything is an add", function() {
    var result = diff('', 'added text');

    assertEquals({added: 'added text', deleted: ''}, result);
});

test("everything is a delete", function() {
    var result = diff('delete me', '');

    assertEquals({added: '', deleted: 'delete me'}, result);
});

test("lcs phrase", function() {
    var common = lcs("the rain", "curse the");

    assertEquals("the", common);
});

test("line diff", function() {
    var result = diff("if (cond)\ndoSomething()", "doSomething()");

    assertEquals({added: '', deleted: 'if (cond)\n'}, result);
});

//test("line diff2", function() {
//    var result = diff("if (cond)\ndoSomething()", "//no check needed\ndoNothing()");
//
//    assertEquals({added: '//no check needed\ndoNothing()', deleted: 'if (cond)\ndoSomething()'}, result);
//});

test("line diff3", function() {
    var result = diff("doSomething()", "if (cond)\ndoSomething()");

    assertEquals({added: 'if (cond)\n', deleted: ''}, result);
});