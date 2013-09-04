var SourceDiff = SourceDiff || {};

SourceDiff.DiffFormatter = function(diff) {
    var _diff = diff;

    var formattedDiff = function(text1, text2) {
        var results = _diff.diff(text1, text2);

        text1 = escapeHtml(text1);
        text2 = escapeHtml(text2);

        var lines = lineUpText(text1, text2, results);

        var text1Lines = lines[0];
        var text2Lines = lines[1];

        findModifiedLines(text1Lines, text2Lines, results);

        var deletedText = formatLeftText(results, text1Lines);
        var addedText = formatRightText(results, text2Lines);

        return [deletedText, addedText];
    };

    var escapeHtml = function(string) {
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };

        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    };

    var findModifiedLines = function(text1Lines, text2Lines, results) {
        results.modifiedRight = [];
        results.modifiedLeft = [];
        for (var i = 0; i < text1Lines.length && i < text2Lines.length; i++) {
            if (contains(results.added, i) && contains(results.deleted, i)) {
                results.modifiedLeft.push({line: i});
                results.modifiedRight.push({line: i});
            } else if (contains(results.added, i) && contains(results.modifiedRight, i - 1)) {
                results.modifiedRight.push({line: i});
            } else if (contains(results.deleted, i) && contains(results.modifiedLeft, i - 1)) {
                results.modifiedLeft.push({line: i});
            }
        }
    };

    var contains = function(array, line) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].line === line) {
                return true;
            }
        }
        return false;
    };

    var updateLineNumbers = function(array, startPos) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].line >= startPos) {
                array[i].line++;
            }
        }
    };

    var lineUpText = function(text1, text2, results) {
        var text1Lines = text1.split(/\r?\n/);
        var text2Lines = text2.split(/\r?\n/);

        _diff.padBlankLines(text1Lines);
        _diff.padBlankLines(text2Lines);

        results.paddingLeft = [];
        results.paddingRight = [];

        for (var i = 0; i < Math.max(text1Lines.length, text2Lines.length); i++) {
            if (!contains(results.deleted, i) && contains(results.added, i)) {
                text1Lines.splice(i, 0, ' ');
                updateLineNumbers(results.deleted, i);
                results.paddingLeft.push({line: i});
            } else if (contains(results.deleted, i) && !contains(results.added, i)) {
                text2Lines.splice(i, 0, ' ');
                updateLineNumbers(results.added, i);
                results.paddingRight.push({line: i});
            }
        }

        return [text1Lines, text2Lines];
    };

    var formatLeftText = function (results, text1Lines) {
        var deletedText = '';

        var startingPos = getStartingPos(results);
        var text1EndingPos = getEndingPos(results, text1Lines);

        for (var i = startingPos; i < text1EndingPos; i++) {
            var className = getClassNameLeft(results, i);
            deletedText += appendLine(className, text1Lines[i]);
        }

        return deletedText;
    };

    var formatRightText = function (results, text2Lines) {
        var addedText = '';

        var startingPos = getStartingPos(results);
        var text2EndingPos = getEndingPos(results, text2Lines);

        for (var i = startingPos; i < text2EndingPos; i++) {
            var className = getClassNameRight(results, i);
            addedText += appendLine(className, text2Lines[i]);
        }
        return addedText;
    };

    var getStartingPos = function(results) {
        var firstDelete = results.deleted.length > 0
            ? results.deleted[0].line
            : 0;

        var firstAdd = results.added.length > 0
            ? results.added[0].line
            : 0;

        var firstEdit = Math.min(firstDelete, firstAdd);

        return Math.max(0, firstEdit - 10);
    };

    var getEndingPos = function(results, lines) {
        var lastDelete = results.deleted.length > 0
            ? results.deleted[results.deleted.length - 1].line
            : 0;

        var lastAdd = results.added.length > 0
            ? results.added[results.added.length - 1].line
            : 0;

        var lastEdit = Math.max(lastDelete, lastAdd);

        return Math.min(lines.length, lastEdit + 10);
    };

    var getClassNameLeft = function (results, i) {
        var className = '';
        if (contains(results.modifiedLeft, i)) {
            className = 'modified';
        } else if (contains(results.paddingLeft, i)) {
            className = 'padding';
        } else if (contains(results.deleted, i)) {
            className = 'deleted';
        }
        return className;
    };

    var getClassNameRight = function (results, i) {
        var className = '';
        if (contains(results.modifiedRight, i)) {
            className = 'modified';
        } else if (contains(results.paddingRight, i)) {
            className = 'padding';
        } else if (contains(results.added, i)) {
            className = 'inserted';
        }
        return className;
    };

    var appendLine = function(className, line) {
        var append = '';

        if (className != '') {
            append += '<span class="' + className + '">';
        }
        append += line.replace(/\t/g, '   ');
        if (className != '') {
            append += '</span>';
        }

        append += '<br>';

        return append;
    };

    return {
        lineUpText: lineUpText, //exposed for testing
        formattedDiff: formattedDiff
    };
};