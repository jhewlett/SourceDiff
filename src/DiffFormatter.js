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
        results.modifiedRight = new SourceDiff.EditSet();
        results.modifiedLeft = new SourceDiff.EditSet();
        for (var i = 0; i < text1Lines.length && i < text2Lines.length; i++) {
            if (results.added.contains(i) && results.deleted.contains(i)) {
                results.modifiedLeft.add(i);
                results.modifiedRight.add(i);
            } else if (results.added.contains(i) && results.modifiedRight.contains(i - 1)) {
                results.modifiedRight.add(i);
            } else if (results.deleted.contains(i) && results.modifiedLeft.contains(i - 1)) {
                results.modifiedLeft.add(i);
            }
        }
    };

    var lineUpText = function(text1, text2, results) {
        var text1Lines = _diff.split(text1);
        var text2Lines = _diff.split(text2);

        _diff.padBlankLines(text1Lines);
        _diff.padBlankLines(text2Lines);

        results.paddingLeft = new SourceDiff.EditSet();
        results.paddingRight = new SourceDiff.EditSet();

        for (var i = 0; i < Math.max(text1Lines.length, text2Lines.length); i++) {
            if (!results.deleted.contains(i) && results.added.contains(i)) {
                text1Lines.splice(i, 0, ' ');
                results.deleted.updateNumbers(i);
                results.paddingLeft.add(i);
            } else if (results.deleted.contains(i) && !results.added.contains(i)) {
                text2Lines.splice(i, 0, ' ');
                results.added.updateNumbers(i);
                results.paddingRight.add(i);
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
        var allDeletes = results.deleted.all();

        var firstDelete = allDeletes.length > 0
            ? allDeletes[0]
            : -1;

        var allAdds = results.added.all();

        var firstAdd = allAdds.length > 0
            ? allAdds[0]
            : -1;

        var firstEdit;
        if (firstDelete === -1) {
            firstEdit = firstAdd;
        } else if (firstAdd === -1) {
            firstEdit = firstDelete;
        } else {
            firstEdit = Math.min(firstDelete, firstAdd)
        }

        return Math.max(0, firstEdit - 10);
    };

    var getEndingPos = function(results, lines) {
        var allDeletes = results.deleted.all();

        var lastDelete = allDeletes.length > 0
            ? allDeletes[allDeletes.length - 1]
            : 0;

        var allAdds = results.added.all();

        var lastAdd = allAdds.length > 0
            ? allAdds[allAdds.length - 1]
            : 0;

        var lastEdit = Math.max(lastDelete, lastAdd);

        return Math.min(lines.length, lastEdit + 10);
    };

    var getClassNameLeft = function (results, i) {
        var className = '';
        if (results.modifiedLeft.contains(i)) {
            className = 'modified';
        } else if (results.paddingLeft.contains(i)) {
            className = 'padding';
        } else if (results.deleted.contains(i)) {
            className = 'deleted';
        }
        return className;
    };

    var getClassNameRight = function (results, i) {
        var className = '';
        if (results.modifiedRight.contains(i)) {
            className = 'modified';
        } else if (results.paddingRight.contains(i)) {
            className = 'padding';
        } else if (results.added.contains(i)) {
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