document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchOptions = document.querySelectorAll('.search-option');
    let currentSearchType = 'all';
    
    // Configuració dels botons de cerca
    searchOptions.forEach(option => {
        option.addEventListener('click', function() {
            searchOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentSearchType = this.dataset.type;
            performSearch();
        });
    });
    
    // Funció principal de cerca
    function performSearch() {
        const searchText = searchInput.value.trim().toLowerCase();
        const entries = document.querySelectorAll('.dictionary-entry');
        
        entries.forEach(entry => {
            // Neteja els ressaltats anteriors
            entry.innerHTML = entry.innerHTML.replace(/\*\*([^*]+)\*\*/g, '$1')
                                           .replace(/<mark>/g, '')
                                           .replace(/<\/mark>/g, '');
            
            if (!searchText) {
                entry.style.display = 'block';
                return;
            }
            
            let searchContent = '';
            const keywords = [];
            
            // Extreure paraules clau marcades
            entry.innerHTML.replace(/\*\*([^*]+)\*\*/g, (match, keyword) => {
                keywords.push(keyword.toLowerCase());
                return match;
            });
            
            // Triar contingut a cercar segons opció
            switch(currentSearchType) {
                case 'keywords':
                    searchContent = keywords.join(' ');
                    break;
                case 'exact':
                    searchContent = keywords.join(' ');
                    break;
                default:
                    searchContent = entry.textContent.toLowerCase();
            }
            
            // Fer la cerca
            const searchWords = searchText.split(/\s+/).filter(w => w);
            let matches = searchWords.every(word => {
                if (currentSearchType === 'exact') {
                    return keywords.some(kw => kw === word);
                }
                return searchContent.includes(word);
            });
            
            // Mostrar/amagar i ressaltar
            entry.style.display = matches ? 'block' : 'none';
            
            if (matches) {
                let html = entry.innerHTML;
                searchWords.forEach(word => {
                    const regex = new RegExp(`(${word})`, 'gi');
                    html = html.replace(regex, '<mark>$1</mark>');
                    
                    // Si és cerca exacta, ressaltar només paraules clau coincidents
                    if (currentSearchType === 'exact') {
                        html = html.replace(/\*\*([^*]+)\*\*/g, (match, kw) => {
                            return kw.toLowerCase() === word ? `<mark>${kw}</mark>` : kw;
                        });
                    }
                });
                entry.innerHTML = html.replace(/\*\*([^*]+)\*\*/g, '$1');
            }
        });
    }
    
    searchInput.addEventListener('input', performSearch);
});
