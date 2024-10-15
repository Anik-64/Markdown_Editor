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
                    title: "Welcome",
                    intro: "Welcome to the Markdown Viewer!👋"
                },
                {
                    title: "Theme Toggle",
                    element: document.querySelector('.toggle-btn'),
                    intro: "This is where you can toggle between light and dark mode.",
                    position: 'bottom'
                },
                {
                    title: "Text Color",
                    element: document.querySelector('#text-color-picker'),
                    intro: "This is where you can change your text color",
                    position: 'bottom'
                },
                {
                    title: "Background Color",
                    element: document.querySelector('#bg-color-picker'),
                    intro: "This is where you can change your background color",
                    position: 'bottom'
                },
                {
                    title: "Resize Gutter",
                    element: document.querySelector('.gutter'),
                    intro: "You can resize this gutter by dragging left or right to adjust the input and preview areas.",
                    position: 'right'
                },
                {
                    title: "Markdown Input",
                    element: document.querySelector('#pad'),
                    intro: "This is where you can write your Markdown text.",
                    position: 'right'
                },
                {
                    title: "Markdown Preview",
                    element: document.querySelector('#markdown'),
                    intro: "This area shows the preview of your Markdown. Have fun!",
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

