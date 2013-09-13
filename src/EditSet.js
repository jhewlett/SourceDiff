var SourceDiff = SourceDiff || {};

SourceDiff.EditSet = function() {
    var _set = {};

    var add = function(line) {
        _set[line.toString()] = true;
    };

    var addValue = function(line, value) {
        _set[line.toString()] = value;
    };

    var remove = function(line) {
        _set[line.toString()] = undefined;
    };

    var count = function() {
        return all().length;
    };

    var get = function(line) {
        return _set[line];
    }

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
        return _set[lineNumber.toString()] !== undefined;
    };

    var updateNumbers = function(lineNumber) {
        var newSet = {};

        for (var prop in _set) {
            var value = _set[prop];
            if (value) {
                var parsed = parseInt(prop);
                if (parsed >= lineNumber) {
                    newSet[(parsed + 1).toString()] = value;
                } else {
                    newSet[parsed.toString()] = value;
                }
            }
        }

        _set = newSet;
    };

    return {
        add: add,
        addValue: addValue,
        get: get,
        remove: remove,
        count: count,
        all: all,
        updateNumbers: updateNumbers,
        contains: contains
    };
};