module('edit set');

test("all sorts integers in increasing value", function() {
    var set = new SourceDiff.EditSet();

    set.add(4);
    set.add(14);
    set.add(3);

    assertEquals([3,4,14], set.all());
});