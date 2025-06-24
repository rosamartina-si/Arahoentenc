# Diccionari de Gramàtica Catalana

## Com funciona la cerca

Utilitza asteriscs (`*`) per indicar paraules que han de coincidir exactament:

| Cerca          | Resultats                                                                 |
|----------------|---------------------------------------------------------------------------|
| `*alçar*`      | Només entrades amb "alçar" exacte                                         |
| `*alçar* *mans*` | Entrades que continguin ambdues paraules exactes                         |
| `*alçar* veu`  | Entrades amb "alçar" exacte + "veu" en qualsevol part                    |
| `subjuntiu`    | Cerca normal (sense exigir coincidència exacta)                          |

## Estructura del projecte

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

## Com afegir noves entrades

1. Crea un nou fitxer HTML a la carpeta `entrades/` (ex: `verb-ser.html`)
2. Utilitza l'estructura d'entrada mostrada a dalt
3. Afegeix el camí del nou fitxer a l'array `entries` a `cercador.js`

## Requisits

Funciona en qualsevol navegador modern sense necessitat de servidor.
