document.addEventListener('DOMContentLoaded', function() {
    const entries = [
        'entrades/alçar.html',
        'entrades/gerundi.html',
        'entrades/preposicions.html'
        // Afegeix aquí totes les altres entrades
    ];
    
    const container = document.getElementById('entries-container');
    const searchInput = document.getElementById('searchInput');
    
    function carregaEntrades() {
        container.innerHTML = '';
        entries.forEach(entry => {
            fetch(entry)
                .then(response => response.text())
                .then(html => {
                    container.innerHTML += html;
                    if (searchInput.value) {
                        cercaEntrades(searchInput.value);
                    }
                });
        });
    }
    
    function cercaEntrades(searchText) {
        const paraulesExactes = [];
        const paraulesNormals = [];
        
        searchText.split(/\s+/).forEach(paraula => {
            const paraulaNet = paraula.trim().toLowerCase();
            if (paraulaNet.startsWith('*') && paraulaNet.endsWith('*') && paraulaNet.length > 2) {
                paraulesExactes.push(paraulaNet.slice(1, -1));
            } else if (paraulaNet) {
                paraulesNormals.push(paraulaNet);
            }
        });
        
        document.querySelectorAll('.dictionary-entry').forEach(entry => {
            const textEntry = entry.textContent.toLowerCase();
            let coincideix = true;
            
            if (paraulesExactes.length > 0) {
                coincideix = paraulesExactes.every(paraula => 
                    textEntry.includes(paraula)
                );
            }
            
            if (coincideix && paraulesNormals.length > 0) {
                coincideix = paraulesNormals.some(paraula =>
                    textEntry.includes(paraula)
                );
            }
            
            entry.style.display = coincideix ? 'block' : 'none';
            
            if (coincideix && searchText) {
                let html = entry.innerHTML;
                paraulesExactes.concat(paraulesNormals).forEach(paraula => {
                    html = html.replace(
                        new RegExp(`(${paraula})`, 'gi'),
                        '<mark>$1</mark>'
                    );
                });
                entry.innerHTML = html;
            }
        });
    }
    
    searchInput.addEventListener('input', (e) => {
        cercaEntrades(e.target.value);
    });
    
    carregaEntrades();
});
