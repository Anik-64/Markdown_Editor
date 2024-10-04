window.onload = function() {
    // Initialize Split.js
    Split(['#pad', '#markdown'], {
        sizes: [50, 50], // Initial sizes in percentage
        minSize: 200,     // Minimum size of each pane in pixels
        gutterSize: 10,   // Width of the gutter in pixels
        cursor: 'col-resize',
        direction: 'horizontal',
        onDrag: function() {
            // Optional: Handle actions during dragging
        }
    });

    // Initialize Showdown converter
    var converter = new showdown.Converter();
    
    // Get references to DOM elements
    var pad = document.getElementById('pad');
    var markdownArea = document.getElementById('markdown');

    // Function to convert Markdown to HTML and display it
    var convertTextAreaToMarkdown = function(){
        var markdownText = pad.value;
        var html = converter.makeHtml(markdownText);
        markdownArea.innerHTML = html;
    };

    // Event listener for input changes in the textarea
    pad.addEventListener('input', convertTextAreaToMarkdown);

    // Initial conversion on page load
    convertTextAreaToMarkdown();
};
