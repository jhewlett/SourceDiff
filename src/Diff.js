var SourceDiff = SourceDiff || {};

SourceDiff.Diff = function(ignoreLeadingWS) {
    var _ignoreLeadingWS = ignoreLeadingWS;

    var trimWhiteSpace = function(str) {
        if (str) {
            str = str.replace(/\s\s*$/, '');

            if (_ignoreLeadingWS) {
                str = str.replace(/^\s\s*/, '');
            }
        }
        return str;
    };

    var split = function(string) {
        return string.split(/\r?\n/);
    }

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

        var added = [];
        var deleted = [];

        while (i >= 0 && j >= 0) {
            if (linesAreEqual(s1Lines[i - 1], s2Lines[j - 1])) {
                i--;
                j--;
            } else if (j >= 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                if (s2Lines[j - 1].length > 0) {
                    added.unshift({line: prefixLines + j - 1, text: s2Lines[j - 1]});   //todo: do I even need to store the text?
                }
                j--;
            } else if (i >= 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                if (s1Lines[i - 1].length > 0) {
                    deleted.unshift({line: prefixLines + i - 1, text: s1Lines[i - 1]});
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
    var checkShiftEdits = function(textLines, edits) {
        if (edits.length > 0) {
            var startRun = edits[0].line;

            var current = startRun;
            for (var i = 1; i < edits.length; i++) {
                if (i === edits.length - 1) {   //end of the run and the edits
                    checkShiftRun(textLines, edits, startRun, current + 1);
                } else if (edits[i].line === current + 1) {
                    current += 1;
                } else {    //end of the run
                    checkShiftRun(textLines, edits, startRun, current);

                    startRun = current = edits[i].line;
                }
            }
        }
    };

    var checkShiftRun = function(textLines, edits, startRun, endRun) {
        if (linesAreEqual(textLines[startRun], textLines[endRun + 1]) && lineIsBlank(textLines[startRun + 1])) {
            removeEdit(edits, startRun);
            edits.push({line: endRun + 1, text: textLines[endRun + 1]});
        }
    };

    var lineIsBlank = function(line) {
        return /^\s*$/.test(line);
    };

    var removeEdit = function(array, line) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].line === line) {
                array.splice(i, 1);
                break;
            }
        }
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
                if (s1Lines[i - 1] === s2Lines[j - 1]) {
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

        while (s1Lines.length > 0 && s2Lines.length > 0 && s1Lines[0] === s2Lines[0]) {
            s1Lines.shift();
            s2Lines.shift();
            prefixLines++;
        }

        while (s1Lines.length > 0 && s2Lines.length > 0 && s1Lines[s1Lines.length - 1] === s2Lines[s2Lines.length - 1]) {
            s1Lines.pop();
            s2Lines.pop();
        }

        return prefixLines;
    };

    return {
        diff: diff,
        trim: trim,   //exposed for testing
        padBlankLines: padBlankLines       //used by DiffFormatter
    };
};