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

        var startingPos = Math.max(0, firstEdit - 10);
        return startingPos;
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

    var doDiff = function() {
        var text1 = document.getElementById('original').value;
        var text2 = document.getElementById('edited').value;

        var results = _diff.diff(text1, text2);

        var lines = lineUpText(text1, text2, results);

        var text1Lines = lines[0];
        var text2Lines = lines[1];

        var startingPos = getStartingPos(results);
        var text1EndingPos = getEndingPos(results, text1Lines);
        var text2EndingPos = getEndingPos(results, text2Lines);

        var deletedText = '';
        for(var i = startingPos; i < text1EndingPos; i++) {
            if (contains(results.deleted, i)) {
                deletedText += '<span class="deleted">';
            }
            deletedText += escapeHtml(text1Lines[i]).replace(/\t/g, '   ');
            if (contains(results.deleted, i)) {
                deletedText += '</span>';
            }
            deletedText += '<br>';
        }

        var addedText = '';
        for(i = startingPos; i < text2EndingPos; i++) {
            if (contains(results.added, i)) {
                addedText += '<span class="inserted">';
            }
            addedText += escapeHtml(text2Lines[i]).replace(/\t/g, '   ');
            if (contains(results.added, i)) {
                addedText += '</span>';
            }
            addedText += "<br>";
        }

        document.getElementById('original_result').innerHTML = deletedText;
        document.getElementById('edited_result').innerHTML = addedText;
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