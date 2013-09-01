"use strict";

function createMatrix(s1Lines, s2Lines) {
    var matrix = [];
    for (var i = 0; i <= s1Lines.length; i++) {
        matrix[i] = new Array(s2Lines.length + 1);
        matrix[i][0] = 0;
    }

    for (var j = 1; j <= s2Lines.length; j++) {
        matrix[0][j] = 0;
    }

    return matrix;
}

function padBlankLines(lines) {
    if (lines.length == 1 && lines[0] == '') {
        return;
    }

    for (var l = 0; l < lines.length; l++) {
        if (lines[l] == '') {
            lines[l] = ' ';
        }
    }
}

function diff(s1, s2) {
    var s1Lines = s1.split('\n');    //todo: handle \r?
    var s2Lines = s2.split('\n');

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
        if (s1Lines[i - 1] === s2Lines[j - 1]) {
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

    return {added: added, deleted: deleted};
}

function fillMatrix(s1Lines, s2Lines, matrix) {
    for (var i = 1; i <= s1Lines.length; i++) {
        for (var j = 1; j <= s2Lines.length; j++) {
            if (s1Lines[i - 1] === s2Lines[j - 1])
                matrix[i][j] = matrix[i - 1][j - 1] + 1;
            else
                matrix[i][j] = Math.max(matrix[i][j - 1], matrix[i - 1][j]);
        }
    }
}

function trim(s1Lines, s2Lines) {
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
}