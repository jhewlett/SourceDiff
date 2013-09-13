var SourceDiff = SourceDiff || {};

SourceDiff.LineFormatter = function(results, lineDiffs) {

    var formatLeftText = function (text1Lines) {
        var deletedText = '';

        var startingPos = getStartingPos(results);
        var text1EndingPos = getEndingPos(results, text1Lines);

        for (var i = startingPos; i < text1EndingPos; i++) {
            if (lineDiffs.contains(i) && results.modifiedLeft.contains(i)) {
                var lineDiff = lineDiffs.get(i);
                deletedText += '<span class="modified">';
                var startIndex = 0;
                for (var j = 0; j < lineDiff.deleted.length; j++) {
                    deletedText += escapeHtml(text1Lines[i].substring(startIndex, lineDiff.deleted[j].position));
                    startIndex = lineDiff.deleted[j].endPosition + 1;
                    deletedText += '<span class="modified-light">' + escapeHtml(text1Lines[i].substring(lineDiff.deleted[j].position, startIndex))
                        + '</span>';
                }

                if (startIndex < text1Lines[i].length) {
                    deletedText += escapeHtml(text1Lines[i].substring(startIndex, text1Lines[i].length));
                }

                deletedText += '</span><br>';
            } else {
                var className = getClassNameLeft(results, i);
                deletedText += appendLine(className, text1Lines[i]);
            }
        }

        return deletedText;
    };

    var formatRightText = function (text2Lines) {
        var addedText = '';

        var startingPos = getStartingPos(results);
        var text2EndingPos = getEndingPos(results, text2Lines);

        for (var i = startingPos; i < text2EndingPos; i++) {
            if (lineDiffs.contains(i) && results.modifiedRight.contains(i)) {
                var lineDiff = lineDiffs.get(i);
                addedText += '<span class="modified">';
                var startIndex = 0;
                for (var j = 0; j < lineDiff.added.length; j++) {
                    addedText += escapeHtml(text2Lines[i].substring(startIndex, lineDiff.added[j].position));
                    startIndex = lineDiff.added[j].endPosition + 1;
                    addedText += '<span class="modified-light">' + escapeHtml(text2Lines[i].substring(lineDiff.added[j].position, startIndex))
                        + '</span>';
                }

                if (startIndex < text2Lines[i].length) {
                    addedText += escapeHtml(text2Lines[i].substring(startIndex, text2Lines[i].length));
                }

                addedText += '</span><br>';
            } else {
                var className = getClassNameRight(results, i);
                addedText += appendLine(className, text2Lines[i]);
            }
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
        append += escapeHtml(line);
        if (className != '') {
            append += '</span>';
        }

        append += '<br>';

        return append;
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

        var replacedTabs = string.replace(/\t/g, '   ');

        return String(replacedTabs).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    };

    return {
        formatLeftText: formatLeftText,
        formatRightText: formatRightText
    };
};