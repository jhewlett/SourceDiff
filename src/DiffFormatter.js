var SourceDiff = SourceDiff || {};

SourceDiff.DiffFormatter = function(diff) {
    var _diff = diff;

    var formattedDiff = function(text1, text2) {
        var results = _diff.diff(text1, text2);

        var lines = lineUpText(text1, text2, results);

        var text1Lines = lines[0];
        var text2Lines = lines[1];

        findModifiedLines(text1Lines, text2Lines, results);

        var lineDiffs = diffModifiedLines(text1Lines, text2Lines, results);

        var lineFormatter = SourceDiff.LineFormatter(results, lineDiffs);

        var deletedText = lineFormatter.formatLeftText(text1Lines);
        var addedText = lineFormatter.formatRightText(text2Lines);

        return [deletedText, addedText];
    };

    var diffModifiedLines = function(text1Lines, text2Lines, results) {
        var lineDiffs = new SourceDiff.EditSet();

        for (var i = 0; i < text1Lines.length && i < text2Lines.length; i++) {
            if (results.modifiedLeft.contains(i) || results.modifiedRight.contains(i)) {
                var lineDiff = _diff.lineDiff(text1Lines[i], text2Lines[i]);
                lineDiff.cleanUp();

                lineDiffs.addValue(i, lineDiff);
            }
        }

        return lineDiffs;
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

    return {
        lineUpText: lineUpText, //exposed for testing
        formattedDiff: formattedDiff
    };
};