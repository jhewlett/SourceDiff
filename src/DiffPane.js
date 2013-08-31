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

    //todo: why is this needed?
//    for (var l = 0; l < text1Lines.length; l++) {
//        if (text1Lines[l] == '') {
//            text1Lines[l] = ' ';
//        }
//    }
//
//    for (l = 0; l < text2Lines.length; l++) {
//        if (text2Lines[l] == '') {
//            text2Lines[l] = ' ';
//        }
//    }

    for (var c = 0; c < results.deleted.length; c++) {
        var line = results.deleted[c].line;
        if (line < text2Lines.length && !contains(results.added, line)) {
            text2Lines.splice(line, 0, '');
            for(var e = 0; e < results.added.length; e++) {
                if (results.added[e].line >= line) {
                    results.added[e].line++;
                }
            }
        }
    }
//
    for (c = 0; c < results.added.length; c++) {
        line = results.added[c].line;
        if (line < text1Lines.length && !contains(results.deleted, line)) {
            text1Lines.splice(line, 0, '');
            for(var d = 0; d < results.deleted.length; d++) {
                if (results.deleted[d].line >= line) {
                    results.deleted[d].line++;
                }
            }
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