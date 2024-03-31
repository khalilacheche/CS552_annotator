document.getElementById('startButton').addEventListener('click', function () {
    reset();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Please upload a file first.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split(/\r?\n/);
        try {
            annotateLines(lines);
        } catch (e) {
            alert("Error in parsing the file. Please make sure the file is in the right format.");
            return;
        }
        document.getElementById('upload-section').style.display = 'none';
    };
    reader.readAsText(file);
});

let currentLine = 0;
let lines = [];
let alreadyAnnotated = 0;


function reset() {
    currentLine = 0;
    lines = [];
    alreadyAnnotated = 0;
}
function annotateLines(fileLines) {
    lines = fileLines;
    lines = lines.filter(l => l.length > 1).map(line => JSON.parse(line));
    alreadyAnnotated = lines.filter(l => ((l.hasOwnProperty("label")) && (l["label"].length > 0))).length;
    showNextLine();
}

window.addEventListener(
    "keydown",
    function (event) { keyStroke(event.key); }
);

function keyStroke(key) {
    if (key === 'ArrowRight') {
        next();
    }
    if (key === 'ArrowLeft') {
        back();
    }
    if (key === 'ArrowDown') {
        annotate("negative");
    }
    if (key === 'ArrowUp') {
        annotate("positive");
    }
}

function back() {
    currentLine--;
    if (currentLine < 0) {
        currentLine = lines.length - 1;
    }
    showNextLine();
}
function next() {
    currentLine++;
    if (currentLine >= lines.length) {
        currentLine = 0;
    }
    showNextLine();
}




function annotate(annotation) {
    //console.log(`Line ${currentLine}: ${lines[currentLine]} - ${annotation}`);
    // Save the annotation along with the line
    console.log(currentLine);
    console.log(lines[currentLine]);
    new_annotation = lines[currentLine];
    new_annotation["label"] = annotation;
    lines[currentLine] = new_annotation;
    //annotations.push(JSON.stringify(new_annotation));
    alreadyAnnotated = lines.filter(l => ((l.hasOwnProperty("label")) && (l["label"].length > 0))).length;
    next();
}

function showNextLine() {
    if (false) {//(alreadyAnnotated >= lines.length) {
        document.getElementById('annotation-section').style.display = 'none';
        alert("Annotation completed! Please click on 'Save Annotations' to download the annotations.");
        return;
    }
    document.getElementById('saveButton').style.display = 'block'; // Show save button at the end
    document.getElementById('sampleText').innerText = lines[currentLine]["review"];
    document.getElementById('annotation-section').style.display = 'block';
    document.getElementById('progress').innerText = `Current sample: ${currentLine + 1}/${lines.length}`;
    document.getElementById('alreadyAnnotated').innerText = `Total annotated: ${alreadyAnnotated}`;

    annotation = lines[currentLine]["label"];
    let givenAnnotationString = "Given annotation: " + annotation;
    if (annotation == "positive") {
        givenAnnotationString += "✅";
    } else if (annotation == "negative") {
        givenAnnotationString += "❌";
    } else {
        givenAnnotationString += "❓";
    }
    document.getElementById('givenAnnotation').innerText = givenAnnotationString;
}

function saveAnnotations() {
    const ls = lines.map(a => JSON.stringify(a));
    const blob = new Blob([ls.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.txt';
    document.body.appendChild(a); // Append <a> element temporarily
    a.click(); // Simulate click to download
    document.body.removeChild(a); // Remove <a> element after downloading
    URL.revokeObjectURL(url); // Clean up to avoid memory leaks
}
