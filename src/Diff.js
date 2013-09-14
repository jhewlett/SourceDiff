var SourceDiff = SourceDiff || {};

SourceDiff.Diff = function(ignoreLeadingWS) {
    var _ignoreLeadingWS = ignoreLeadingWS;

    var trimTrailingWhiteSpace = function(str) {
        if (str) {
            return str.replace(/\s\s*$/, '');
        }
        return str;
    };

    var checkTrimLeadingWhiteSpace = function(str) {
        if (str && _ignoreLeadingWS) {
            return str.replace(/^\s\s*/, '');
        }
        return str;
    };

    var trimWhiteSpace = function(str) {
        str = trimTrailingWhiteSpace(str);
        str = checkTrimLeadingWhiteSpace(str);

        return str;
    };

    var split = function(string) {
        return string.split(/\r?\n/);
    };

    var lineDiff = function(s1, s2) {
        var s1Trimmed = checkTrimLeadingWhiteSpace(s1);
        var s2Trimmed = checkTrimLeadingWhiteSpace(s2);

        var s1Offset = s1.length - s1Trimmed.length;
        var s2Offset = s2.length - s2Trimmed.length;

        s1Trimmed = trimTrailingWhiteSpace(s1Trimmed);
        s2Trimmed = trimTrailingWhiteSpace(s2Trimmed);

        var matrix = createMatrix(s1Trimmed, s2Trimmed);

        fillMatrix(s1Trimmed, s2Trimmed, matrix);

        var diff = new SourceDiff.LineDiff();

        var i = s1Trimmed.length;
        var j = s2Trimmed.length;

        while (i >= 0 && j >= 0) {
            if (s1Trimmed[i - 1] === s2Trimmed[j - 1]) {
                if (s1Trimmed[i - 1]) {
                    diff.addCommon(s1Offset + i - 1, s2Offset + j - 1, s1Trimmed[i - 1].length);
                }
                i--;
                j--;
            } else if (j >= 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                if (s2Trimmed[j - 1].length > 0) {
                    diff.addInsert(s2Offset + j - 1, s2Trimmed[j - 1].length);
                }
                j--;
            } else if (i >= 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                if (s1Trimmed[i - 1].length > 0) {
                    diff.addDelete(s1Offset + i - 1, s1Trimmed[i - 1].length);
                }
                i--;
            }
        }

        return diff;
    };

    var diff = function(s1, s2) {
        var s1Lines = split(s1);
        var s2Lines = split(s2);

        padBlankLines(s1Lines);
        padBlankLines(s2Lines);

        var prefixLines = trim(s1Lines, s2Lines);

        var matrix = createMatrix(s1Lines, s2Lines);

        fillMatrix(s1Lines, s2Lines, matrix);

        var i = s1Lines.length;
        var j = s2Lines.length;

        var added = new SourceDiff.EditSet();
        var deleted = new SourceDiff.EditSet();

        while (i >= 0 && j >= 0) {
            if (linesAreEqual(s1Lines[i - 1], s2Lines[j - 1])) {
                i--;
                j--;
            } else if (j >= 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                if (s2Lines[j - 1].length > 0) {
                    added.add(prefixLines + j - 1);
                }
                j--;
            } else if (i >= 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                if (s1Lines[i - 1].length > 0) {
                    deleted.add(prefixLines + i - 1);
                }
                i--;
            }
        }

        checkShiftEdits(split(s1), deleted);
        checkShiftEdits(split(s2), added);

        return {added: added, deleted: deleted};
    };

    var linesAreEqual = function(line1, line2) {
        return trimWhiteSpace(line1) === trimWhiteSpace(line2);
    };

    //Find all continuous runs of inserts or deletes. For each run, see if it can be shifted forward 1 line.
    //This is useful for properly pairing opening and closing braces in C-like languages, for example.
    var checkShiftEdits = function(textLines, editSet) {
        var editArray = editSet.all();
        if (editArray.length > 0) {
            var startRun = editArray[0];

            var current = startRun;
            for (var i = 1; i < editArray.length; i++) {
                if (i === editArray.length - 1) {   //end of the run and the edits
                    if (editArray[i] === current + 1) {
                        current++;
                    }
                    checkShiftRun(textLines, editSet, startRun, current);
                } else if (editArray[i] === current + 1) {
                    current ++;
                } else {    //end of the run
                    checkShiftRun(textLines, editSet, startRun, current);

                    startRun = current = editArray[i];
                }
            }
        }
    };

    var checkShiftRun = function(textLines, editSet, startRun, endRun) {
        if (linesAreEqual(textLines[startRun], textLines[endRun + 1]) && lineIsBlank(textLines[startRun + 1])) {
            editSet.remove(startRun);
            editSet.add(endRun + 1);
        }
    };

    var lineIsBlank = function(line) {
        return /^\s*$/.test(line);
    };

    var createMatrix = function(s1Lines, s2Lines) {
        var matrix = [];
        for (var i = 0; i <= s1Lines.length; i++) {
            matrix[i] = new Array(s2Lines.length + 1);
            matrix[i][0] = 0;
        }

        for (var j = 1; j <= s2Lines.length; j++) {
            matrix[0][j] = 0;
        }

        return matrix;
    };

    var fillMatrix = function(s1Lines, s2Lines, matrix) {
        for (var i = 1; i <= s1Lines.length; i++) {
            for (var j = 1; j <= s2Lines.length; j++) {
                if (linesAreEqual(s1Lines[i - 1], s2Lines[j - 1])) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i][j - 1], matrix[i - 1][j]);
                }
            }
        }
    };

    var padBlankLines = function(lines) {
        if (lines.length === 1 && lines[0] === '') {
            return;
        }

        for (var l = 0; l < lines.length; l++) {
            if (lines[l] === '') {
                lines[l] = ' ';
            }
        }
    };

    var trim = function(s1Lines, s2Lines) {
        var prefixLines = 0;

        while (s1Lines.length > 0 && s2Lines.length > 0 && linesAreEqual(s1Lines[0], s2Lines[0])) {
            s1Lines.shift();
            s2Lines.shift();
            prefixLines++;
        }

        while (s1Lines.length > 0 && s2Lines.length > 0 && linesAreEqual(s1Lines[s1Lines.length - 1], s2Lines[s2Lines.length - 1])) {
            s1Lines.pop();
            s2Lines.pop();
        }

        return prefixLines;
    };

    return {
        diff: diff,
        trim: trim,   //exposed for testing
        padBlankLines: padBlankLines,       //used by DiffFormatter
        lineDiff: lineDiff,
        split: split                    //used by DiffFormatter
    };
};