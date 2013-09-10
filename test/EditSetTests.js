module('edit set');

test("all sorts integers in increasing value", function() {
    var set = new SourceDiff.EditSet();

    set.add(4);
    set.add(14);
    set.add(3);

    assertEquals([3,4,14], set.all());
});

test("all does not return removed numbers", function() {
    var set = new SourceDiff.EditSet();

    set.add(2);
    set.add(3);

    set.remove(2);

    assertEquals([3], set.all());
});

test("updateNumbers does not update removed numbers", function() {
    var set = new SourceDiff.EditSet();

    set.add(2);
    set.add(3);
    set.add(4);
    set.add(5);

    set.remove(4);

    set.updateNumbers(3);

    assertEquals([2, 4, 6], set.all());
});