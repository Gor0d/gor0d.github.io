# gor0d.github.io

Portfólio de **Emerson Guimarães** — Analista de Dados & IA, foco em HealthTech.
Publicado em <https://gor0d.github.io/> via GitHub Pages.

## Estrutura

```
index.html            # conteúdo (hero, sobre, projetos, stack, experiência, formação, contato)
assets/css/style.css  # tema MAGI/cyberpunk, layout, animações, responsivo
assets/js/main.js     # boot sequence, canvas de fundo, cursor, scramble, terminal, filtros, reveal
```

Sem build e sem dependências: HTML, CSS e JS puros. Fontes via Google Fonts.

## Rodar localmente

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Atualizar projetos

Cada projeto é um `<article class="card">` em `index.html`, dentro de `#projectsGrid`.

- `data-cat`: categorias separadas por espaço (`ia`, `saude`, `web`, `dados`, `wip`) — alimentam os filtros.
- `.badge`: `badge-wip` (em andamento), `badge-active` (ativo), `badge-prod` (em produção), `badge-done` (concluído).
- O contador "PROJETOS NO PORTFÓLIO" na seção Sobre (`data-to`) e a linha do boot devem ser ajustados manualmente.

## Extras

- Tecla `` ` `` (ou botão TERMINAL) abre um terminal interativo: `help`, `projects`, `stack`, `goto <seção>`.
- `prefers-reduced-motion` desativa o boot, o canvas animado, tilt e glitch.
