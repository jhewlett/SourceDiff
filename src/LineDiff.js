var SourceDiff = SourceDiff || {};

SourceDiff.LineDiff = function() {
    var added = [];
    var deleted = [];
    var common = [];

    var addCommon = function(leftPosition, rightPosition, length) {
        common.unshift({
            leftPosition: leftPosition,
            leftEndPosition: leftPosition + length - 1,
            rightPosition: rightPosition,
            rightEndPosition: rightPosition + length - 1
        });
    };

    var addDelete = function(position, length) {
        deleted.unshift({
            position: position,
            endPosition: position + length - 1});
    };

    var addInsert = function(position, length) {
        added.unshift({
            position: position,
            endPosition: position + length - 1});
    };

    var editLength = function(edit) {
        if (!edit) {
            return 0;
        }
        return edit.endPosition - edit.position + 1;
    };

    var commonLength = function(edit) {
        return edit.leftEndPosition - edit.leftPosition + 1;
    };

    var cleanUp = function() {
        mergeAdjacent(added);
        mergeAdjacent(deleted);

        for (var i = 0; i < common.length; i++) {
            if (i + 1 < common.length
                    && common[i].leftEndPosition + 1 === common[i + 1].leftPosition
                    && common[i].rightEndPosition + 1 === common[i + 1].rightPosition) {
                common[i].leftEndPosition = common[i + 1].leftEndPosition;
                common[i].rightEndPosition = common[i + 1].rightEndPosition;
                common.splice(i + 1, 1);
                i--;
            }
        }

        var cont = true;
        while (cont) {
            cont = false;
            for (var i = 0; i < common.length; i++) {
                var equalityLength = commonLength(common[i]);

                var leftDelete = findEditWithEndingPosition(deleted, common[i].leftPosition - 1);
                var rightDelete = findEditWithPosition(deleted, common[i].leftEndPosition + 1);

                var leftAdd = findEditWithEndingPosition(added, common[i].rightPosition - 1);
                var rightAdd = findEditWithPosition(added, common[i].rightEndPosition + 1);
                if (editLength(leftDelete) + editLength(leftAdd) >= equalityLength
                        && editLength(rightDelete) + editLength(rightAdd) >= equalityLength) {
                    cont = true;
                    if (leftDelete) {
                        if (rightDelete) {
                            leftDelete.endPosition = rightDelete.endPosition;
                            removeEdit(deleted, rightDelete);
                        } else {
                            leftDelete.endPosition = common[i].leftEndPosition;
                        }
                    } else {
                        if (rightDelete) {
                            rightDelete.position = common[i].leftPosition;
                        } else {
                            addEdit(deleted, common[i].leftPosition, common[i].leftEndPosition);
                        }
                    }
                    if (leftAdd) {
                        if (rightAdd) {
                            leftAdd.endPosition = rightAdd.endPosition;
                            removeEdit(added, rightAdd);
                        } else {
                            leftAdd.endPosition = common[i].rightEndPosition;
                        }
                    } else {
                        if (rightAdd) {
                            rightAdd.position = common[i].rightPosition;
                        } else {
                            addEdit(added, common[i].rightPosition, common[i].rightEndPosition);
                        }
                    }

                    common.splice(i, 1);
                }
            }
        }
    };

    var addEdit = function(edits, position, endPosition) {
        var newEdit = {
            position: position,
            endPosition: endPosition
        };

        for (var i = 0; i < edits.length; i++) {
            if (position > edits[i].position) {
                edits.splice(i + 1, 0, newEdit);
                break;
            }
        }

        if (edits.length === 0) {
            edits.push(newEdit);
        }
    };

    var removeEdit = function(edits, item) {
        for (var i = 0; i < edits.length; i++) {
            if (edits[i] === item) {
                edits.splice(i, 1);
                break;
            }
        }
    };

    var findEditWithPosition = function(edits, pos) {
        for (var i = 0; i < edits.length; i++) {
            if (edits[i].position === pos) {
                return edits[i];
            }
        }
    };

    var findEditWithEndingPosition = function(edits, endPos) {
        for (var i = 0; i < edits.length; i++) {
            if (edits[i].endPosition === endPos) {
                return edits[i];
            }
        }
    };

    var mergeAdjacent = function (edits) {
        for (var i = 0; i < edits.length; i++) {
            if (i + 1 < edits.length && edits[i].endPosition + 1 === edits[i + 1].position) {
                edits[i].endPosition = edits[i + 1].endPosition;
                edits.splice(i + 1, 1);
                i--;
            }
        }
    };

    return {
        addDelete: addDelete,
        addInsert: addInsert,
        addCommon: addCommon,
        cleanUp: cleanUp,
        added: added,
        deleted: deleted,
        common: common
    };
};