var SourceDiff = SourceDiff || {};

SourceDiff.DiffFormatter = function(diff) {
    var _diff = diff;

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
        var text1Lines = text1.split('\n');
        var text2Lines = text2.split('\n');

        _diff.padBlankLines(text1Lines);
        _diff.padBlankLines(text2Lines);

        for (var i = 0; i < text1Lines.length && i < text2Lines.length; i++) {
            if (contains(results.deleted, i) && !contains(results.added, i)) {
                text2Lines.splice(i, 0, '');
                updateLineNumbers(results.added, i);
            } else if (!contains(results.deleted, i) && contains(results.added, i)) {
                text1Lines.splice(i, 0, '');
                updateLineNumbers(results.deleted, i);
            }
        }

        return [text1Lines, text2Lines];
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

    var formatLines = function (startingPos, endingPos, modifiedPositions, lines, className) {
        var formattedText = '';

        for (var i = startingPos; i < endingPos; i++) {
            if (contains(modifiedPositions, i)) {
                formattedText += '<span class="' + className + '">';
            }
            formattedText += escapeHtml(lines[i]).replace(/\t/g, '   ');
            if (contains(modifiedPositions, i)) {
                formattedText += '</span>';
            }
            formattedText += '<br>';
        }

        return formattedText;
    };

    var doDiff = function(text1, text2) {
        var results = _diff.diff(text1, text2);

        var lines = lineUpText(text1, text2, results);

        var text1Lines = lines[0];
        var text2Lines = lines[1];

        var startingPos = getStartingPos(results);
        var text1EndingPos = getEndingPos(results, text1Lines);
        var text2EndingPos = getEndingPos(results, text2Lines);

        var deletedText = formatLines(startingPos, text1EndingPos, results.deleted, text1Lines, 'deleted');
        var addedText = formatLines(startingPos, text2EndingPos, results.added, text2Lines, 'inserted');

        return [deletedText, addedText];
    };

    var escapeHtml = function(string) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    };

    return {
        lineUpText: lineUpText, //exposed for testing
        doDiff: doDiff
    };
};