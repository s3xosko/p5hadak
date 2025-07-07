(function() {
const textEl = document.getElementById('loading-text');
const states = ['.', '. .', '. . .'];
let idx = 2;
setInterval(() => {
    idx = (idx + 1) % states.length;
    textEl.textContent = 'Loading ' + states[idx];
}, 1000);
})();