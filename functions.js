
function getTranspositionButtons(songIndex, transpositionDegree, transpositionSemitone) {
    song = songBook.songs[songIndex]
    text = ""
    if (song.key != "") {
        for (k = 0; k < keys.length; k++) {
            //for default
            originalKeyName = "C"
            if (keys.filter(function (key) { return key.major == originalKeyName || key.major == originalKeyName }).length > 0) {
                originalKeyName = song.key
            }

            //for major originalKeyName
            if (keys.filter(function (key) { return key.major == originalKeyName }).length > 0) {
                currentKeyName = keys[k].major
                originalKeyNote = (notes.filter(function (note) { return note.nameBase == originalKeyName.toLowerCase() }))[0]
                currentKeyNote = (notes.filter(function (note) { return note.nameBase == currentKeyName.toLowerCase() }))[0]
            }
            //for minor originalKeyName
            else {
                currentKeyName = keys[k].minor
                originalKeyNote = (notes.filter(function (note) { return note.nameBase == originalKeyName.toLowerCase() }))[0]
                currentKeyNote = (notes.filter(function (note) { return note.nameBase == currentKeyName.toLowerCase() }))[0]
            }

            newTranspositionDegree = (currentKeyNote.degree - originalKeyNote.degree + 7) % 7
            newTranspositionSemitone = (currentKeyNote.semitone - originalKeyNote.semitone + 12) % 12

            keyDescription = keys[k].major + "/" + keys[k].minor
            onclickMethod = "onclick =\"transposeSong(" + songIndex + "," + newTranspositionDegree + "," + newTranspositionSemitone + ");\""

            //border for current key
            borderStyle = ""
            if (transpositionDegree == newTranspositionDegree && transpositionSemitone == newTranspositionSemitone) {
                borderStyle = 'border: solid 2px black;'
            }
            //bold font for original key
            if (keys[k].major == originalKeyName || keys[k].minor == originalKeyName) {
                text += "<span style='font-weight: bold; " + borderStyle + "' " + onclickMethod + "> " + keyDescription + "&nbsp;</span> "
            }
            else {
                text += "<span style='" + borderStyle + "' " + onclickMethod + "> " + keyDescription + "&nbsp;</span> "
            }
        }
    }
    return text;
}
function transposeChord(originalChord, transpositionDegree, transpositionSemitone) {
    if (originalChord in chordsDictionary) {
        type = chordsDictionary[originalChord]["type"]
        originalHTML = chordsDictionary[originalChord]["html"]
        originalBase = chordsDictionary[originalChord]["base"]
        for (note of notes) {
            if (note.nameBase == originalBase) {
                originalNote = note
                break
            }
        }
        originalDegree = originalNote["degree"]
        originalSemitone = originalNote["semitone"]

        transposedSemitone = (originalSemitone + transpositionSemitone) % 12
        transposedDegree = (originalDegree + transpositionDegree) % 7
        for (note of notes) {
            if (note["degree"] == transposedDegree && note["semitone"] == transposedSemitone) {
                transposedNote = note
                break
            }
        }
        transposedBase = transposedNote.nameBase
        for (chord in chordsDictionary) {
            if (chordsDictionary[chord]["base"] == transposedBase && chordsDictionary[chord]["type"] == type) {
                transposedChord = chordsDictionary[chord]["html"]
            }
        }
        return transposedChord
    }
    else {
        return originalChord
    }
}
function transposeNotes(originalNotes, transpositionDegree, transpositionSemitone) {
    var transposedNotes = "tabstave notation=true tablature=false \nnotes :1 " + originalNotes
    for (noteOriginal of notes) {
        for (noteTransposed of notes) {
            if (noteTransposed["degree"] == (noteOriginal["degree"] + transpositionDegree) % 7 &&
                noteTransposed["semitone"] == (noteOriginal["semitone"] + transpositionSemitone) % 12) {
                for (oktave = 2; oktave < 7; oktave++) {
                    var oktaveChange = 0;
                    if (noteOriginal["degree"] + transpositionDegree >= 7) {
                        oktaveChange += 1;
                    }
                    if (transpositionSemitone > 6) {
                        oktaveChange -= 1;
                    }
                    transposedNotes = transposedNotes.replace(new RegExp(" " + noteOriginal.nameNote + oktave, 'g'), " " + noteTransposed.nameVexFlow + '/' + (oktave + oktaveChange))
                }
            }
        }
    }

    return transposedNotes
}
function transposeSong(songIndex, transpositionDegree, transpositionSemitone) {
    song = songBook.songs[songIndex]

    document.getElementById('transpositionButtons_' + songIndex).innerHTML = getTranspositionButtons(songIndex, transpositionDegree, transpositionSemitone)
    for (j = 0; j < song.lines.length; j++) {
        for (k = 0; k < song.lines[j].guitarChords.length; k++) {
            document.getElementById('chord_' + songIndex + '_' + j + '_' + k).innerHTML = transposeChord(song.lines[j].guitarChords[k], transpositionDegree, transpositionSemitone)
        }
        var notesDiv = document.getElementById('notes_' + songIndex + '_' + j)
        if (notesDiv != null) {
            notesEditor = notesDiv.getElementsByClassName('editor')[0]
            notesEditor.value = transposeNotes(song.lines[j].notes, transpositionDegree, transpositionSemitone)
            var evt = document.createEvent('Events');
            evt.initEvent('keyup', true, true);
            evt.view = window;
            notesEditor.dispatchEvent(evt);
        }
    }
}
function songToHTML(songIndex) {
    song = songBook.songs[songIndex]

    maxChords = Math.max.apply(Math, song.lines.map(function (i) { return i.guitarChords.length }))
    maxIndent = Math.max.apply(Math, song.lines.map(function (i) { return i.indent }))

    cols = Math.max.apply(Math, song.lines.map(function (i) { return i.guitarChords.length + i.indent }))

    text = "<div class='songContainer' id='Song_" + i + "'>"
    text += "<table style='width:100%;'><tr><td style='font-size: 9px;'>"
    text += "<span id='transpositionButtons_" + songIndex + "'>" + getTranspositionButtons(songIndex, 0, 0); + "</span>"
    text += "</td><td style='text-align: right; style='font-size: 9px;' rowspan='2'>"
    text += (song.singer != "") ? ("Wykonawca: " + song.singer + "<br/>") : ""
    text += (song.composer != "") ? ("Muzyka: " + song.composer + "<br/>") : ""
    text += (song.songwriter != "") ? ("Słowa: " + song.songwriter + "<br/>") : ""
    text += "</td></tr><tr><td style='font-size: 20px; font-weight: bold;'>"
    if (song.link != "") {
        text += "<a href='" + song.link + "' target='blank '>" + song.title + "</a>"
    }
    else {
        text += song.title
    }
    text += "</td></tr></table>"

    text += "<table style='margin-top: 30px;'>"
    var tdStyle = ""
    for (j = 0; j < song.lines.length; j++) {
        line = song.lines[j]
        text += "<tr>"
        for (k = 0; k < line.indent; k++) {
            text += "<td>&nbsp;&nbsp;&nbsp;</td>";
        }
        if (line.indent > 0 &&
            ((j > 0 && song.lines[j - 1].lirics == "")
                ||
                (tdStyle != "")
            )
        ) {
            tdStyle = "font-weight: bold;"
        }
        else {
            tdStyle = ""
        }

        text += "<td style='" + tdStyle + " white-space: nowrap;' colspan='" + (maxIndent + 1) + "'>" + line.lirics + "</td>"
        text += "<td></td>"

        for (k = 0; k < line.guitarChords.length; k++) {
            if (line.guitarChords[k] in chordsDictionary) {

                text += "<td style='" + tdStyle + "' id='chord_" + songIndex + "_" + j + "_" + k + "'>" + transposeChord(line.guitarChords[k], 0, 0) + "</td>"
            }
            else {
                text += "<td style='" + tdStyle + "' id='chord_" + songIndex + "_" + j + "_" + k + "'>" + line.guitarChords[k] + "</td>"
            }
        }

        for (k = 0; k < cols - line.indent - line.guitarChords.length; k++) {
            text += "<td></td>"
        }
        if (line.notes.length > 0) {
            text += "<td style='padding-left: " + (line.indent * 20) + "px;'><span id='notes_" + songIndex + "_" + j + "'><div class='vex-tabdiv' scale='0.5' editor='true'>" +
                "<canvas class='vex-canvas'></canvas>" +
                "<pre><div class='editor-error'></div><pre>" +
                //"<textarea class='editor' >tabstave notation=true tablature=false clef=treble key=Gm time=2/4 \nnotes " + line.notes + "</textarea>" +
                "<textarea class='editor' >" + transposeNotes(line.notes, 0, 0) + "</textarea>" +
                "</div></span></td>"
        }
        else {
            text += "<td></td>"
        }
        text += "</tr>"
    }
    text += "</table>"
    text += "<hr/>"
    text += "</div>"
    return text
}

function filterSongs() {
    var filter = document.getElementById("filterInput").value.toLowerCase();
    var contentDiv = document.getElementById("contentDiv");
    var songs = contentDiv.getElementsByClassName("songContainer");
    var findedCount = 0;
    for (var i = 0; i < songs.length; i++) {
        var songText = songs[i].innerText.toLowerCase();
        if (songText.indexOf(filter) > -1) {
            songs[i].style.display = "";
            findedCount++;
        } else {
            songs[i].style.display = "none";
        }
    }
    document.getElementById("findedCount").innerText = findedCount + "/" + songs.length
}