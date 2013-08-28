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

function diff(s1, s2) {
    var s1Lines = s1.split('\n');    //todo: handle \r?
    var s2Lines = s2.split('\n');

    trim(s1Lines, s2Lines);

    if (s1Lines.length === 1 && s1Lines[0].length === 0) {
        return {added: [s2], deleted: []};
    }
    else if (s2Lines.length === 1 && s2Lines[0].length === 0) {
        return {added: [], deleted: [s1]};
    }

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
            added.unshift(s2Lines[j - 1]);
            j--;
        } else if (i >= 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
            deleted.unshift(s1Lines[i - 1]);
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

function lcs(s1, s2) {
    var matrix = createMatrix(s1, s2);

    fillMatrix(s1, s2, matrix);

    return backtrack(matrix, s1, s2, s1.length, s2.length);
}

function backtrack(matrix, s1, s2, i, j) {
    if (i === 0 || j === 0) {
        return "";
    } else if(s1[i - 1] === s2[j - 1]) {
        return backtrack(matrix, s1, s2, i - 1, j - 1) + s1[i - 1];
    } else {
        if (matrix[i][j - 1] > matrix[i - 1][j])
            return backtrack(matrix, s1, s2, i, j - 1);
        else
            return backtrack(matrix, s1, s2, i - 1, j);
    }
}

function trim(s1Lines, s2Lines) {
    while (s1Lines.length > 0 && s2Lines.length > 0 && s1Lines[0] === s2Lines[0]) {
        s1Lines.shift(); // = s1Lines.substring(1);
        s2Lines.shift(); // = s2Lines.substring(1);
    }

    while (s1Lines.length > 0 && s2Lines.length > 0 && s1Lines[s1Lines.length - 1] === s2Lines[s2Lines.length - 1]) {
        s1Lines.pop();// = s1Lines.substring(0, s1Lines.length - 1);
        s2Lines.pop();// = s2Lines.substring(0, s2Lines.length - 1);
    }
}


