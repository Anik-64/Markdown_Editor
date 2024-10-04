window.onload = function() {
    // Initialize Split.js
    Split(['#pad', '#markdown'], {
        sizes: [50, 50], // Initial sizes in percentage
        minSize: 200,     // Minimum size of each pane in pixels
        gutterSize: 10,   // Width of the gutter in pixels
        cursor: 'col-resize',
        direction: 'horizontal',
        onDragEnd: function(sizes) {
            // Optional: Handle actions after dragging ends
        }
    });

    // Initialize Showdown converter
    var converter = new showdown.Converter();
    
    // Get references to DOM elements
    var pad = document.getElementById('pad');
    var markdownArea = document.getElementById('markdown');
    var themeSwitch = document.getElementById('theme-switch');
    var themeLabel = document.getElementById('theme-label');

    // Function to convert Markdown to HTML and display it
    var convertTextAreaToMarkdown = function(){
        var markdownText = pad.value;
        var html = converter.makeHtml(markdownText);
        markdownArea.innerHTML = html;
    };

    // Event listener for input changes in the textarea
    pad.addEventListener('input', convertTextAreaToMarkdown);

    // Theme Switching Logic
    var setTheme = function(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeSwitch.checked = true;
            themeLabel.textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('dark-theme');
            themeSwitch.checked = false;
            themeLabel.textContent = 'Light Mode';
        }
    };

    // Load saved theme from localStorage
    var savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Event listener for theme toggle
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            setTheme('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            setTheme('light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Initial conversion on page load
    convertTextAreaToMarkdown();
};
