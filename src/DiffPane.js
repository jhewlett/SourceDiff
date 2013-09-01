function contains(array, line) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].line === line) {
            return true;
        }
    }
    return false;
}

function updateLineNumbers(array, startPos) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].line >= startPos) {
            array[i].line++;
        }
    }
}

function lineUpText(text1, text2, results) {
    var text1Lines = text1.split('\n');
    var text2Lines = text2.split('\n');

    padBlankLines(text1Lines);
    padBlankLines(text2Lines);

    for (var i = 0; i < text1Lines.length && i < text2Lines.length; i++) {
        if (contains(results.deleted, i) && !contains(results.added, i)) {
            text2Lines.splice(i, 0, '');
            updateLineNumbers(results.added, i);
        } else if (!contains(results.deleted, i) && contains(results.added, i)) {
            text1Lines.splice(i, 0, '');
            updateLineNumbers(results.deleted, i);
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

    var deletedText = '';
    for(var i = 0; i < text1Lines.length; i++) {
        if (contains(results.deleted, i)) {
            deletedText += '<span class="deleted">';
        }
        deletedText += text1Lines[i];
        if (contains(results.deleted, i)) {
            deletedText += '</span>';
        }
        deletedText += '<br>';
    }

    var addedText = '';
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