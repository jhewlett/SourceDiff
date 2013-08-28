"use strict";

function createMatrix(s1, s2) {
    var matrix = [];
    for (var i = 0; i <= s1.length; i++) {
        matrix[i] = new Array(s2.length + 1);
        matrix[i][0] = 0;
    }

    for (var j = 1; j <= s2.length; j++) {
        matrix[0][j] = 0;
    }

    return matrix;
}

function diff(s1, s2) {
    var result = trim(s1, s2);
    s1 = result[0];
    s2 = result[1];

    var matrix = createMatrix(s1, s2);

    fillMatrix(s1, s2, matrix);

    var i = s1.length;
    var j = s2.length;

    var added = "";
    var deleted = "";

    if (i === 0) {
        added = s2;
    } else if (j === 0) {
        deleted = s1;
    }

    while (i > 0 && j > 0) {
        if (s1[i - 1] === s2[j - 1]) {
            i--;
            j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            added = s2[j - 1] + added;//added.push(s2[j - 1]);
            j--;
        } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
            deleted = s1[i - 1] + deleted;
            i--;
        }
    }

    return {added: added, deleted: deleted};
}

function fillMatrix(s1, s2, matrix) {
    for (var i = 1; i <= s1.length; i++) {
        for (var j = 1; j <= s2.length; j++) {
            if (s1[i - 1] === s2[j - 1])
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

function trim(s1, s2) {
    while (s1.length > 0 && s2.length > 0 && s1[0] === s2[0]) {
        s1 = s1.substring(1);
        s2 = s2.substring(1);
    }

    while (s1.length > 0 && s2.length > 0 && s1[s1.length - 1] === s2[s2.length - 1]) {
        s1 = s1.substring(0, s1.length - 1);
        s2 = s2.substring(0, s2.length - 1);
    }

    return [s1, s2];
}


