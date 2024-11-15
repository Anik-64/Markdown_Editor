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

    // Helper function to set a cookie
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }

    // Helper function to get a cookie
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    // Check if the "dontShowAgain" cookie exists
    if (!getCookie('intro_dont_show_again')) {
        // Initialize Intro.js for the tour
        introJs().setOptions({
            dontShowAgain: true, // Enable the "Don't Show Again" checkbox
            steps: [
                {
                    title: "👋 Welcome to Markdown Viewer!",
                    intro: "Hello there! Let's embark on a quick tour of Markdown Viewer and discover its cool features. Ready? Let's go!"
                },
                {
                    title: "🌗 Switch Themes Effortlessly!",
                    element: document.querySelector('.toggle-btn'),
                    intro: "Feeling the need for a change? Toggle between light and dark mode to suit your mood. Give it a try!",
                    position: 'bottom'
                },
                {
                    title: "🎨 Customize Your Text Color",
                    element: document.querySelector('#text-color-picker'),
                    intro: "Want your text to pop with some color? Pick your favorite shade and watch your text come to life!",
                    position: 'bottom'
                },
                {
                    title: "🖼️ Set Your Background Mood",
                    element: document.querySelector('#bg-color-picker'),
                    intro: "A good background sets the tone! Select a background color that feels just right for you.",
                    position: 'bottom'
                },
                {
                    title: "📖 Markdown Cheat Sheet",
                    element: document.querySelector('.cheat-sheet-btn'),
                    intro: "New to Markdown? Don’t worry! Click here to access a handy cheat sheet and master Markdown syntax quickly!",
                    position: 'bottom'
                },
                {
                    title: "🎯 Clickable Markdown Shortcuts",
                    element: document.querySelector('.toolbar'),
                    intro: "Speed up your writing by using these quick formatting buttons. Just click, and the correct Markdown syntax will appear for you!",
                    position: 'bottom'
                },
                {
                    title: "💾 Download Your Work",
                    element: document.querySelector('.download-btn'),
                    intro: "Ready to save your masterpiece? Click this button to download your Markdown text as a .md file.",
                    position: 'bottom'
                },
                {
                    title: "↔️ Resizable Gutter",
                    element: document.querySelector('.gutter'),
                    intro: "Need more space to preview or write? Simply drag this gutter left or right to adjust the size of the input and preview areas.",
                    position: 'right'
                },
                {
                    title: "✍️ Write Your Markdown",
                    element: document.querySelector('#pad'),
                    intro: "This is your creative canvas! Type your Markdown here, and see it beautifully transformed into formatted text instantly.",
                    position: 'right'
                },
                {
                    title: "🔍 Live Markdown Preview",
                    element: document.querySelector('#markdown'),
                    intro: "Here's where the magic happens! As you type, watch your Markdown transform in real time. Enjoy the smooth preview!",
                    position: 'left'
                }
            ]
        }).oncomplete(function() {
            // If the "Don't Show Again" checkbox is checked, store the cookie
            var dontShowAgainCheckbox = document.querySelector(".introjs-dontshowagain");
            if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
                setCookie('intro_dont_show_again', 'true', 365); // Cookie will expire in 1 year
            }
        }).onexit(function() {
            // Handle the case when the user clicks the "X" (exit) button
            var dontShowAgainCheckbox = document.querySelector(".introjs-dontshowagain");
            if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
                setCookie('intro_dont_show_again', 'true', 365);
            }
        }).start();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const pad = document.getElementById('pad');
    const markdown = document.getElementById('markdown');
    const themeSwitch = document.getElementById('theme-switch');

    const bgColorPicker = document.getElementById('bg-color-picker');
    const textColorPicker = document.getElementById('text-color-picker');

    // Convert markdown to HTML
    const converter = new showdown.Converter();
    pad.addEventListener('input', function () {
        markdown.innerHTML = converter.makeHtml(pad.value);
    });

    // Theme switch toggle
    themeSwitch.addEventListener('change', function () {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            document.getElementById('theme-label').textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('dark-theme');
            document.getElementById('theme-label').textContent = 'Light Mode';
        }
    });

    // Handle background color change
    bgColorPicker.addEventListener('input', function (event) {
        document.documentElement.style.setProperty('--background-color', event.target.value);
        document.documentElement.style.setProperty('--textarea-background', event.target.value);
        document.documentElement.style.setProperty('--preview-background', event.target.value);
    });

    // Handle text color change
    textColorPicker.addEventListener('input', function (event) {
        document.documentElement.style.setProperty('--text-color', event.target.value);
    });

    // Set default values for color pickers
    bgColorPicker.value = '#ffffff'; // Default background color
    textColorPicker.value = '#000000'; // Default text color
});

// New toolbar and markdown conversion logic
document.addEventListener('DOMContentLoaded', function() {
    const converter = new showdown.Converter();
    const pad = document.getElementById('pad');
    const markdownArea = document.getElementById('markdown');
    const modal = document.getElementById('modal');

    // Markdown conversion on input
    pad.addEventListener('input', updateMarkdown);

    function updateMarkdown() {
        const markdownText = pad.value;
        markdownArea.innerHTML = converter.makeHtml(markdownText);
    }

    // Markdown Toolbar Functions
    function insertAtCursor(text) {
        const start = pad.selectionStart;
        const end = pad.selectionEnd;
        const padText = pad.value;
        pad.value = padText.substring(0, start) + text + padText.substring(end);
        pad.focus();
        updateMarkdown();
    }

    window.applyBold = function() {
        insertAtCursor('**bold text**');
    };

    window.applyItalic = function() {
        insertAtCursor('_italic text_');
    };

    window.applyHeader = function() {
        insertAtCursor('# Heading 1\n');
    };

    window.applyList = function() {
        insertAtCursor('- List item\n');
    };

    window.applyLink = function() {
        insertAtCursor('[link](http://example.com)');
    };

    window.applyCode = function() {
        insertAtCursor('```\nCode block\n```');
        modal.style.display = "none";
    };

    window.applyImage = function() {
        insertAtCursor('![alt text](http://image-url.com)');
        modal.style.display = "none";
    };

    window.applyQuote = function() {
        insertAtCursor('> Blockquote');
        modal.style.display = "none";
    };

    window.applySubscript = function() {
        insertAtCursor('<sub>subscript</sub>');
        modal.style.display = "none";
    };

    window.applyInlineCode = function() {
        insertAtCursor('`inline code`');
        modal.style.display = "none";
    };

    window.applyOrderedList = function() {
        insertAtCursor('1. Ordered item\n2. Ordered item\n');
        modal.style.display = "none";
    };

    window.applySubList = function() {
        insertAtCursor('- Main item\n  - Sub-item\n');
        modal.style.display = "none";
    };

    window.applyHorizontalRule = function() {
        insertAtCursor('---\n');
        modal.style.display = "none";
    };

    window.applyTaskList = function() {
        insertAtCursor('- [ ] Task\n- [x] Completed task\n');
        modal.style.display = "none";
    };

    window.applyBanner = function() {
        insertAtCursor("![MasterHead](http://image-url.gif)\n");
        modal.style.display = "none";
    };

    // Modal controls
    window.openModal = function() {
        modal.style.display = 'flex';
    };

    window.closeModal = function() {
        modal.style.display = 'none';
    };

    // Close the modal if the user clicks outside the modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});

// Download content
function downloadMarkdown() {
    // Get the Markdown content from the textarea
    const markdownContent = document.getElementById('pad').value;

    // Create a Blob with the Markdown content
    const blob = new Blob([markdownContent], { type: 'text/markdown' });

    // Create a temporary anchor element to trigger the download
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'document.md'; // Default filename
    anchor.style.display = 'none';

    // Append the anchor to the document, trigger the click, and remove it
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}