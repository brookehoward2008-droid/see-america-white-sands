// dist/script.js: Provide keyboard-accessible inspection of the study palette.
document.querySelectorAll('[data-color]').forEach(button => {button.addEventListener('click', () => {document.getElementById('color-label').textContent=button.dataset.color;});});
