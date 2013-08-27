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

test("LCS with cs of length 4", function () {
    var cs = lcs("abdef", "abdabde");

    assertEquals("abde", cs);
});

test("LCS with cs of length 4", function () {
    var cs = lcs("ABCDEFG", "BCDGK");

    assertEquals("BCDG", cs);
});

test("Xml snippet 2", function () {
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
