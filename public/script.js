window.onload = function() {
    // Retrieve saved sizes from localStorage or use default [50, 50]
    var savedSizes = JSON.parse(localStorage.getItem('split-sizes')) || [50, 50];

    // Initialize Split.js
    var splitInstance = Split(['#pad', '#markdown'], {
        sizes: savedSizes,
        minSize: 200,
        gutterSize: 10,
        cursor: 'col-resize',
        direction: 'horizontal',
        onDragEnd: function(sizes) {
            // Save sizes to localStorage when dragging ends
            localStorage.setItem('split-sizes', JSON.stringify(sizes));
        },
        onDrag: function(direction, sizes, gutterElement) {
            // Add dragging class when dragging starts
            gutterElement.classList.add('dragging');
        }
    });

    // Remove dragging class on mouseup
    document.addEventListener('mouseup', function() {
        var gutters = document.querySelectorAll('.gutter');
        gutters.forEach(function(gutter) {
            gutter.classList.remove('dragging');
        });
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

    // Theme Switching Logic
    var themeSwitch = document.getElementById('theme-switch');
    var themeLabel = document.getElementById('theme-label');

    // Function to set the theme
    var setTheme = function(isDark) {
        if (isDark) {
            document.body.classList.add('dark-theme');
            themeLabel.textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('dark-theme');
            themeLabel.textContent = 'Light Mode';
        }
        // Save theme preference to localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    // Event listener for theme toggle
    themeSwitch.addEventListener('change', function() {
        setTheme(this.checked);
    });

    // Initialize theme based on saved preference
    var savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        themeSwitch.checked = true;
        setTheme(true);
    } else {
        themeSwitch.checked = false;
        setTheme(false);
    }

    // Initialize Intro.js for the tour
    introJs().setOptions({
        steps: [
            {
                element: document.querySelector('.toggle-btn'),
                intro: "This is where you can toggle between light and dark mode.",
                position: 'bottom'
            },
            {
                element: document.querySelector('.gutter'),
                intro: "You can resize this gutter by dragging left or right to adjust the input and preview areas.",
                position: 'right'
            }
        ]
    }).start();
};
