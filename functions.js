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
function transposeSong(songIndex, transpositionDegree, transpositionSemitone) {
    song = songBook.songs[songIndex]

    document.getElementById('transpositionButtons_' + songIndex).innerHTML = getTranspositionButtons(songIndex, transpositionDegree, transpositionSemitone)
    for (j = 0; j < song.lines.length; j++) {
        for (k = 0; k < song.lines[j].guitarChords.length; k++) {
            document.getElementById('chord_' + songIndex + '_' + j + '_' + k).innerHTML = transposeChord(song.lines[j].guitarChords[k], transpositionDegree, transpositionSemitone)
        }
    }
}
window.songToHTML = function(songIndex) {
    song = songBook.songs[songIndex]

    maxChords = Math.max.apply(Math, song.lines.map(function (i) { return i.guitarChords.length }))
    maxIndent = Math.max.apply(Math, song.lines.map(function (i) { return i.indent }))

    cols = Math.max.apply(Math, song.lines.map(function (i) { return i.guitarChords.length + i.indent }))

    text = "<div class='songContainer' id='Song_" + i + "'>"
    text += "<table class='songTable'><tr><td style='font-size: 9px;'>"
    text += "<span id='transpositionButtons_" + songIndex + "'>" + getTranspositionButtons(songIndex, 0, 0); + "</span>"
    text += "</td><td style='text-align: right; style='font-size: 9px;' rowspan='2'>"
    text += (song.singer != "") ? ("Wykonawca: " + song.singer + "<br/>") : ""
    text += (song.composer != "") ? ("Muzyka: " + song.composer + "<br/>") : ""
    text += (song.songwriter != "") ? ("Słowa: " + song.songwriter + "<br/>") : ""
    text += "</td></tr><tr><td style='font-size: 20px; font-weight: bold;'>"
    text += song.title
    text += " <button class='edit-btn' onclick='editSong(" + songIndex + ")'>✏️ Edytuj</button>";
    text += " <button class='delete-btn' onclick='deleteSong(" + songIndex + ")'>🗑️ Usuń</button>";
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
        text += "</tr>"
    }
    text += "</table>"
    text += "<hr/>"
    text += "</div>"
    return text
}

window.filterSongs = function() {
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

function editSong(songIndex) {
    var song;
    var isNew = false;
    if (songIndex === -1) {
        song = {
            title: '',
            singer: '',
            composer: '',
            songwriter: '',
            key: '',
            lines: []
        };
        isNew = true;
    } else {
        song = songBook.songs[songIndex];
    }
    var editorDiv = document.getElementById('editorDiv');
    if (!editorDiv) {
        editorDiv = document.createElement('div');
        editorDiv.id = 'editorDiv';
        editorDiv.style.position = 'fixed';
        editorDiv.style.top = '0';
        editorDiv.style.left = '0';
        editorDiv.style.width = '100%';
        editorDiv.style.height = '100%';
        editorDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
        editorDiv.style.zIndex = '1000';
        editorDiv.style.display = 'flex';
        editorDiv.style.justifyContent = 'center';
        editorDiv.style.alignItems = 'center';
        document.body.appendChild(editorDiv);
    }
    var songText = isNew ? `Tytuł: Nowa Piosenka\nWykonawca: ---\nMuzyka: ---\nSłowa: ---\nKlucz: C\n` : toSongText(song);
    editorDiv.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; max-width: 800px; max-height: 80%; overflow-y: auto;">
            <h2>${isNew ? 'Dodaj nową piosenkę' : 'Edytuj piosenkę'}</h2>
            <h3>Tekst piosenki (z metadanymi i liniami w formacie tekst|akordy):</h3>
            <textarea id="editSongText" rows="25" cols="80" class="songEditorTextarea">${songText}</textarea><br>
            <button class="save-btn" onclick="saveSong(${songIndex})">💾 Zapisz</button>
            <button class="cancel-btn" onclick="closeEditor()">❌ Anuluj</button>
        </div>
    `;
    editorDiv.style.display = 'flex';
}

function saveSong(songIndex) {
    var song;
    var isNew = false;
    if (songIndex === -1) {
        song = {
            title: '',
            singer: '',
            composer: '',
            songwriter: '',
            key: '',
            lines: []
        };
        isNew = true;
    } else {
        song = songBook.songs[songIndex];
    }
    
    var songText = document.getElementById('editSongText').value;
    var parsed = parseSongText(songText);
    if (parsed.errors && parsed.errors.length > 0) {
        alert("Błędy walidacji:\n" + parsed.errors.join('\n'));
        return;
    }
    if (!parsed.metadata.title) {
        alert("Tytuł jest obowiązkowy!");
        return;
    }
    song.title = parsed.metadata.title;
    song.singer = parsed.metadata.singer || '';
    song.composer = parsed.metadata.composer || '';
    song.songwriter = parsed.metadata.songwriter || '';
    song.key = parsed.metadata.key || '';
    song.lines = parsed.lines;
    
    if (isNew) {
        songBook.songs.unshift(song);
    } else {
        songBook.songs[songIndex] = song;
    }
    
    // Save to Firestore
    saveSongBook();
    
    // Refresh display
    refreshSongs();
    filterSongs(); // Reapply current filter
    closeEditor();
}

function toSongText(song) {
    var text = '';
    if (song.title) text += 'Tytuł: ' + song.title + '\n';
    if (song.singer) text += 'Wykonawca: ' + song.singer + '\n';
    if (song.composer) text += 'Muzyka: ' + song.composer + '\n';
    if (song.songwriter) text += 'Słowa: ' + song.songwriter + '\n';
    if (song.key) text += 'Klucz: ' + song.key + '\n';
    //text += '\n';
    song.lines.forEach(line => {
        var indentStr = ' '.repeat(line.indent * 4);
        var chordsStr = line.guitarChords ? line.guitarChords.join(' ') : '';
        text += indentStr + line.lirics + (chordsStr ? '|' + chordsStr : '') + '\n';
    });
    return text.trim();
}

function parseSongText(text) {
    var lines = [];
    var metadata = {};
    var errors = [];
    var textLines = text.split('\n');
    var i = 0;
    while (i < textLines.length) {
        var line = textLines[i];
        var trimmed = line.trim();
        var spaces = line.length - line.trimStart().length;
        var indent = Math.floor(spaces / 4);
        if (trimmed === '') {
            // empty line
            lines.push({
                indent: indent,
                lirics: '',
                guitarChords: []
            });
        } else if (trimmed.toLowerCase().startsWith('tytuł: ')) {
            if (!metadata.title) metadata.title = trimmed.substring(trimmed.toLowerCase().indexOf('tytuł: ') + 7).trim();
        } else if (trimmed.toLowerCase().startsWith('wykonawca: ')) {
            if (!metadata.singer) metadata.singer = trimmed.substring(trimmed.toLowerCase().indexOf('wykonawca: ') + 11).trim();
        } else if (trimmed.toLowerCase().startsWith('muzyka: ')) {
            if (!metadata.composer) metadata.composer = trimmed.substring(trimmed.toLowerCase().indexOf('muzyka: ') + 7).trim();
        } else if (trimmed.toLowerCase().startsWith('słowa: ')) {
            if (!metadata.songwriter) metadata.songwriter = trimmed.substring(trimmed.toLowerCase().indexOf('słowa: ') + 6).trim();
        } else if (trimmed.toLowerCase().startsWith('klucz: ')) {
            if (!metadata.key) metadata.key = trimmed.substring(trimmed.toLowerCase().indexOf('klucz: ') + 6).trim();
        } else if (trimmed.includes('|')) {
            var parts = trimmed.split('|');
            var lirics = parts[0].trim();
            var chords = parts[1] ? parts[1].trim().split(/\s+/) : [];
            chords.forEach(chord => {
                if (!(chord in chordsDictionary)) {
                    errors.push("Akord '" + chord + "' w linii " + (i + 1) + " nie jest poprawny");
                }
            });
            lines.push({
                indent: indent,
                lirics: lirics,
                guitarChords: chords
            });
        } else {
            // line without |, just lyrics
            lines.push({
                indent: indent,
                lirics: trimmed,
                guitarChords: []
            });
        }
        i++;
    }
    return { metadata: metadata, lines: lines, errors: errors };
}

function closeEditor() {
    document.getElementById('editorDiv').style.display = 'none';
}

window.addNewSong = function() {
    editSong(-1);
}

function refreshSongs() {
    var songsHtml = "";
    for (var i = 0; i < songBook.songs.length; i++) {
        songsHtml += songToHTML(i);
    }
    document.getElementById("contentDiv").innerHTML = songsHtml;
}

function deleteSong(songIndex) {
    if (confirm('Czy na pewno chcesz usunąć tę piosenkę?')) {
        songBook.songs.splice(songIndex, 1);
        saveSongBook();
        refreshSongs();
    }
}

// Firebase functions moved to songBook.html
