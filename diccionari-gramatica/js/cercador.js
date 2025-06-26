document.addEventListener('DOMContentLoaded', function() {
    const entries = [
        'entrades/alçar.html',
        'entrades/gerundi.html'
        // Afegeix aquí més entrades
    ];
    
    const container = document.getElementById('entries-container');
    const searchInput = document.getElementById('searchInput');
    const searchOptions = document.querySelectorAll('.search-option');
    let currentSearchType = 'all';
    
    // Configura els botons de cerca
    searchOptions.forEach(option => {
        option.addEventListener('click', function() {
            searchOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentSearchType = this.dataset.type;
            if (searchInput.value) performSearch();
        });
    });
    
    // Carrega totes les entrades
    function loadEntries() {
        container.innerHTML = '';
        entries.forEach(entry => {
            fetch(entry)
                .then(response => response.text())
                .then(html => {
                    container.innerHTML += html;
                    if (searchInput.value) performSearch();
                })
                .catch(error => {
                    console.error(`Error carregant ${entry}:`, error);
                });
        });
    }
    
    // Funció principal de cerca
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const entries = document.querySelectorAll('.dictionary-entry');
        
        entries.forEach(entry => {
            let searchContent = '';
            
            // Determina què cercar segons el tipus seleccionat
            switch(currentSearchType) {
                case 'titles':
                    searchContent = entry.querySelector('[data-search="title"]').textContent.toLowerCase();
                    break;
                case 'examples':
                    const examples = entry.querySelectorAll('[data-search="example"]');
                    searchContent = Array.from(examples).map(ex => ex.textContent).join(' ').toLowerCase();
                    break;
                default: // 'all'
                    searchContent = entry.textContent.toLowerCase();
            }
            
            // Fer la cerca
            const words = searchTerm.split(/\s+/).filter(w => w);
            let matches = words.length === 0 || words.every(word => 
                searchContent.includes(word)
            );
            
            entry.style.display = matches ? 'block' : 'none';
            
            // Ressaltar coincidències
            if (matches && searchTerm) {
                let html = entry.innerHTML;
                words.forEach(word => {
                    const regex = new RegExp(`(${word})`, 'gi');
                    html = html.replace(regex, '<mark>$1</mark>');
                });
                entry.innerHTML = html;
            }
        });
    }
    
    // Inicialitza
    loadEntries();
    searchInput.addEventListener('input', performSearch);
});
