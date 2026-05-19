// DOM Elements
const loadingOverlay = document.getElementById('loading');
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const previewContent = document.getElementById('preview-content');
const tabEdit = document.getElementById('tab-edit');
const tabPreview = document.getElementById('tab-preview');
const paneEdit = document.getElementById('pane-edit');
const panePreview = document.getElementById('pane-preview');

const converter = new showdown.Converter({
    tables: true,
    tasklists: true,
    strikethrough: true,
    emoji: true,
    smoothLivePreview: true,
    ghCodeBlocks: true,
    smartIndentationFix: true,
    requireSpaceBeforeHeadingText: true,
    simpleLineBreaks: false
});

let monacoEditor = null;
let currentTab = 'edit';

// Default Markdown Template
const defaultMarkdown = `# Welcome to the Modern Markdown Editor

## Features
- **Real-time preview**
- **Syntax Highlighting** powered by Monaco Editor
- **Dark/Light Mode**
- **PDF Export**
- **Auto-save** (try refreshing the page!)

### Code Block Example
\`\`\`javascript
function sayHello() {
    console.log("Hello, World!");
}
\`\`\`

### Task List
- [x] Integrate Tailwind CSS
- [x] Add Monaco Editor
- [ ] Write awesome content
`;

// Theme Handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
    }
}

themeToggleBtn.addEventListener('click', () => {
    htmlEl.classList.toggle('dark');
    const isDark = htmlEl.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (monacoEditor) {
        monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
    }
});

// Mobile Tabs Handling
window.switchTab = function(tab) {
    currentTab = tab;
    if (tab === 'edit') {
        tabEdit.classList.replace('border-transparent', 'border-blue-600');
        tabEdit.classList.replace('text-slate-500', 'text-blue-600');
        tabEdit.classList.replace('dark:text-slate-400', 'dark:text-blue-400');
        
        tabPreview.classList.replace('border-blue-600', 'border-transparent');
        tabPreview.classList.replace('text-blue-600', 'text-slate-500');
        tabPreview.classList.replace('dark:text-blue-400', 'dark:text-slate-400');
        
        panePreview.classList.add('translate-x-full');
        paneEdit.classList.remove('-translate-x-full');
    } else {
        tabPreview.classList.replace('border-transparent', 'border-blue-600');
        tabPreview.classList.replace('text-slate-500', 'text-blue-600');
        tabPreview.classList.replace('dark:text-slate-400', 'dark:text-blue-400');
        
        tabEdit.classList.replace('border-blue-600', 'border-transparent');
        tabEdit.classList.replace('text-blue-600', 'text-slate-500');
        tabEdit.classList.replace('dark:text-blue-400', 'dark:text-slate-400');
        
        panePreview.classList.remove('translate-x-full');
        paneEdit.classList.add('-translate-x-full');
    }
};

// Markdown Rendering
function renderMarkdown(text) {
    previewContent.innerHTML = converter.makeHtml(text);
    
    const codeBlocks = previewContent.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper relative group mb-4';
        pre.parentNode.insertBefore(wrapper, pre);
        
        pre.style.marginBottom = '0';
        
        wrapper.appendChild(pre);
        
        const btn = document.createElement('button');
        btn.className = 'copy-btn absolute top-2 right-2 p-1.5 bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 backdrop-blur-sm';
        btn.innerHTML = '<i class="ph ph-copy"></i>';
        btn.title = 'Copy code';
        
        btn.addEventListener('click', () => {
            const code = pre.querySelector('code');
            if (code) {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    btn.innerHTML = '<i class="ph ph-check text-green-500"></i>';
                    btn.classList.add('md:opacity-100'); 
                    setTimeout(() => {
                        btn.innerHTML = '<i class="ph ph-copy"></i>';
                        btn.classList.remove('md:opacity-100');
                    }, 2000);
                });
            }
        });
        
        wrapper.appendChild(btn);
    });
}

function saveContent(text) {
    localStorage.setItem('md-content', text);
}

function loadContent() {
    return localStorage.getItem('md-content');
}

// PDF Export
window.exportPDF = function() {
    const element = previewContent.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.classList.add('markdown-body');
    wrapper.style.padding = '20px';
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.appendChild(element);

    const copyBtns = wrapper.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => btn.remove());

    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'Markdown_Document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        pagebreak: { 
            mode: ['css', 'legacy'], 
            avoid: ['pre', 'img', 'blockquote', 'table', 'tr', 'h1', 'h2', 'h3']
        },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            onclone: (clonedDoc) => {
                clonedDoc.documentElement.classList.remove('dark');
            }
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(wrapper).save();
};

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.41.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    document.fonts.ready.then(function() {
        const isDark = htmlEl.classList.contains('dark');
        const savedContent = loadContent();
        
        monacoEditor = monaco.editor.create(document.getElementById('editor-container'), {
            value: savedContent || defaultMarkdown,
            language: 'markdown',
            theme: isDark ? 'vs-dark' : 'vs',
            wordWrap: 'on',
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            automaticLayout: true,
            scrollbar: {
                horizontal: 'hidden'
            }
        });

        renderMarkdown(monacoEditor.getValue());
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 300);

        monacoEditor.onDidChangeModelContent(() => {
            const val = monacoEditor.getValue();
            renderMarkdown(val);
            saveContent(val);
        });

        monaco.editor.remeasureFonts();

    window.editorAction = function(action) {
        if (!monacoEditor) return;
        
        const selection = monacoEditor.getSelection();
        const model = monacoEditor.getModel();
        const text = model.getValueInRange(selection);
        let insertText = '';
        let insertRange = selection;
        let newSelection = selection;

        switch (action) {
            case 'bold':
                insertText = `**${text || 'bold text'}**`;
                break;
            case 'italic':
                insertText = `*${text || 'italic text'}*`;
                break;
            case 'strikethrough':
                insertText = `~~${text || 'strikethrough'}~~`;
                break;
            case 'heading':
                insertText = `\n# ${text || 'Heading'}\n`;
                break;
            case 'quote':
                insertText = `\n> ${text || 'Blockquote'}\n`;
                break;
            case 'code':
                if (text.includes('\\n')) {
                    insertText = `\n\`\`\`\n${text || 'code block'}\n\`\`\`\n`;
                } else {
                    insertText = `\`${text || 'inline code'}\``;
                }
                break;
            case 'link':
                insertText = `[${text || 'link text'}](https://)`;
                break;
            case 'image':
                insertText = `![${text || 'alt text'}](https://)`;
                break;
            case 'ul':
                insertText = text ? text.split('\\n').map(line => `- ${line}`).join('\\n') : '\\n- list item\\n';
                break;
            case 'ol':
                insertText = text ? text.split('\\n').map((line, i) => `${i+1}. ${line}`).join('\\n') : '\\n1. list item\\n';
                break;
        }

        monacoEditor.executeEdits("toolbar", [{
            range: insertRange,
            text: insertText,
            forceMoveMarkers: true
        }]);
        monacoEditor.focus();
    };
    });
});

initTheme();