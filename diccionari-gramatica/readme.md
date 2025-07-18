# Diccionari de Gramàtica Catalana

## Instruccions d'Ús

### Sistema de Cerca
1. **Marqueu les paraules clau** en el contingut amb doble asterisc: `**paraula**`
2. **Seleccioneu el tipus de cerca**:
   - **Cercar a tot arreu**: Cerca a tot el text
   - **Només paraules clau**: Cerca només en paraules marcades (accepta parcials)
   - **Coincidència exacta**: Cerca només paraules marcades que coincideixin exactament

### Exemples de Cerca

| Paraules clau marcades | Cerca | Tipus | Resultat |
|------------------------|-------|-------|----------|
| **alçar**, **aixecar** | `alç` | Només paraules clau | TROBA (**alçar**) |
| **alçar**, **aixecar** | `alç` | Exacte | NO troba |
| **alçar**, **aixecar** | `aixecar` | Exacte | TROBA |

## Estructura de Fitxers

diccionari-gramatica/
├── index.html          # Pàgina principal
├── readme.md          # Documentació (aquest arxiu)
├── js/
│   └── cercador.js    # Lògica de cerca
├── css/
│   └── estils.css     # Estils CSS
└── entrades/
    ├── alçar.html     # Entrada sobre el verb "alçar"
    ├── gerundi.html   # Entrada sobre gerundis
    ├── preposicions.html # Entrada sobre preposicions
    └── ...            # Altres entrades

## Com Afegir Entrades
1. Afegiu un nou `<div class="dictionary-entry">` a `index.html`
2. Marqueu les paraules clau amb `**paraula**`
3. Les paraules marcades es podran cercar amb els filtres especials


