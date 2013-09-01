function contains(array, line) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].line === line) {
            return true;
        }
    }
    return false;
}

function lineUpText(text1, text2, results) {
    var text1Lines = text1.split('\n');
    var text2Lines = text2.split('\n');

    padBlankLines(text1Lines);
    padBlankLines(text2Lines);

    var text1Pos = 0;
    var text2Pos = 0;

    while(text1Pos < text1Lines.length && text2Pos < text2Lines.length) {
        if (contains(results.deleted, text1Pos) && !contains(results.added, text2Pos)) {
            text2Lines.splice(text2Pos, 0, '');
            for (var e = 0; e < results.added.length; e++) {
                if (results.added[e].line >= text2Pos) {
                    results.added[e].line++;
                }
            }
            text1Pos++;
            text2Pos++;
        } else if (!contains(results.deleted, text1Pos) && contains(results.added, text2Pos)) {
            text1Lines.splice(text1Pos, 0, '');
            for (var d = 0; d < results.deleted.length; d++) {
                if (results.deleted[d].line >= text1Pos) {
                    results.deleted[d].line++;
                }
            }
            text1Pos++;
            text2Pos++;
        } else {
            text1Pos++;
            text2Pos++;
        }
    }

    return [text1Lines, text2Lines];
}

function doDiff() {
    var text1 = document.getElementById('original').value;
    var text2 = document.getElementById('edited').value;

    var results = diff(text1, text2);

    var lines = lineUpText(text1, text2, results);

    var text1Lines = lines[0];
    var text2Lines = lines[1];

    var deletedText = "";
    for(var i = 0; i < text1Lines.length; i++) {
        if (contains(results.deleted, i)) {
            deletedText += '<span class="deleted">';
        }
        deletedText += text1Lines[i];
        if (contains(results.deleted, i)) {
            deletedText += '</span>';
        }
        deletedText += "<br>";
    }

    var addedText = "";
    for(i = 0; i < text2Lines.length; i++) {
        if (contains(results.added, i)) {
            addedText += '<span class="inserted">';
        }
        addedText += text2Lines[i];
        if (contains(results.added, i)) {
            addedText += '</span>';
        }
        addedText += "<br>";
    }

    document.getElementById('original_result').innerHTML = deletedText;
    document.getElementById('edited_result').innerHTML = addedText;
}