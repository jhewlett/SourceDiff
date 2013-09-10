var SourceDiff = SourceDiff || {};

SourceDiff.EditSet = function() {
    var _set = {};

    var add = function(line) {
        _set[line.toString()] = true;
    };

    var remove = function(line) {
        _set[line.toString()] = false;
    };

    var count = function() {
        return all().length;
    };

    var sortIntegers = function(a, b) {
        return a - b;
    };

    var all = function() {
        var arr = [];

        for (var prop in _set) {
            if (_set[prop]) {
                arr.push(parseInt(prop));
            }
        }

        return arr.sort(sortIntegers);
    };

    var contains = function(lineNumber) {
        return _set[lineNumber.toString()] === true;
    };

    var updateNumbers = function(lineNumber) {
        var newSet = {};

        for (var prop in _set) {
            var parsed = parseInt(prop);
            if (parsed >= lineNumber) {
                newSet[parsed + 1] = true;
            } else {
                newSet[parsed] = true;
            }
        }

        _set = newSet;
    };

    return {
        add: add,
        remove: remove,
        count: count,
        all: all,
        updateNumbers: updateNumbers,
        contains: contains
    };
};