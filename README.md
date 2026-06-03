# Landing Page — Anhanguera

Landing page de captação de leads para eventos presenciais da Anhanguera. O objetivo é converter visitantes em cadastros qualificados, que são atendidos pelo WhatsApp em até 24h com uma proposta de matrícula personalizada.

## Estrutura

```
/
├── index.html              # Página principal
├── legal.html              # Política de privacidade
├── style.css               # Estilos
├── script.js               # Máscara de telefone, validação e envio do formulário
├── assets/                 # Imagens e logos
├── apps-script/
│   └── form-handler.gs     # Script do Google Apps Script (backend do formulário)
└── .github/workflows/      # Deploy automático via FTP
```

## Seções da página

- **Barra de urgência** — alerta de vagas limitadas fixado no topo
- **Hero** — headline principal com CTA e estatísticas
- **Benefícios** — diferenciais da oferta exclusiva do evento
- **Cursos** — cards de Graduação e Pós-Graduação
- **FAQ** — quebra de objeções comuns
- **Formulário** — captura de leads enviada para Google Sheets

## Formulário / Backend

Os dados são enviados para uma planilha Google Sheets via Google Apps Script (endpoint configurado em `script.js`). Não há servidor próprio — o envio usa `fetch` com `mode: no-cors`.

**Proteções:** honeypot anti-bot, rate limiting de 30s entre envios, sanitização contra XSS e injeção de fórmula em planilha.

### Google Apps Script

O código do script está versionado em [apps-script/form-handler.gs](apps-script/form-handler.gs). Ele recebe os dados do formulário via `POST` e os grava como uma nova linha na planilha ativa.

**Colunas gravadas (na ordem):** `dataHora`, `nome`, `whatsapp`, `idade`, `email`, `escolaridade`, `pretendenciaEnsinoSuperior`, `modalidade`, `evento`.

**Para implantar o script:**
1. Acesse [script.google.com](https://script.google.com) e abra (ou crie) o projeto vinculado à planilha.
2. Cole o conteúdo de `form-handler.gs` no editor.
3. Publique como **Web App** → acesso para "Qualquer pessoa".
4. Copie a URL gerada e atualize a constante `APPS_SCRIPT_URL` em `script.js`.

## Deploy

O deploy é automático via GitHub Actions sempre que há push na branch `main`. Os arquivos são enviados por FTP para o servidor cPanel.

**Secrets necessários no repositório:**
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`


