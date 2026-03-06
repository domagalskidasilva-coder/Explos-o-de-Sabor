# Confeitaria Duas Vontades

Site completo em Next.js + React para uma doceria brasileira com foco em simplicidade, acessibilidade e pedido pelo WhatsApp.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Motion para microinteracoes e overlays

## Principais recursos

- Home com apresentacao da loja, destaques e orientacoes de pedido
- Pagina `/cardapio` com filtros por categoria e subcategoria
- Carrinho persistido em `localStorage`
- Checkout em modal com validacao acessivel
- Envio do pedido para `wa.me` com mensagem pre-preenchida
- Controle de fonte `A-`, `A` e `A+`
- Layout responsivo com contraste forte e alvos de toque grandes

## Estrutura principal

- `app/layout.tsx`: layout raiz, header, footer e overlays globais
- `app/page.tsx`: pagina inicial
- `app/cardapio/page.tsx`: catalogo completo
- `app/politica-de-privacidade/page.tsx`: uso basico dos dados do pedido
- `src/data/produtos.ts`: seed data de doces e salgados brasileiros
- `src/data/loja.ts`: dados da loja e pontos de customizacao
- `src/contexts/CartContext.tsx`: estado global do carrinho com persistencia
- `src/components/*`: header, cards, drawer, modal e filtros
- `public/images/produtos/*`: fotos locais de estoque prontas para substituir
- `docs/image-sources.md`: referencia das fotos usadas nesta versao

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env.local` com o numero do WhatsApp:

```bash
cp .env.example .env.local
```

3. Edite `.env.local` e ajuste o numero no formato internacional, sem espacos:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

4. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

5. Abra `http://localhost:3000`.

## Scripts disponiveis

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Onde customizar

- Produtos, precos e disponibilidade: `src/data/produtos.ts`
- Endereco e horario: `src/data/loja.ts`
- Numero do WhatsApp: `.env.local` e ambiente de deploy
- Textos e secoes da home: `app/page.tsx`
- Fotos dos produtos: `public/images/produtos`

Os arquivos de dados ja tem comentarios `TODO` indicando os pontos mais provaveis de ajuste.

## Regras do pedido

- Credito, debito e dinheiro: pagamento na retirada
- Pix: unico pagamento antecipado
- O pedido final e confirmado no WhatsApp
- O MVP nao usa backend, banco de dados ou autenticacao

## Deploy na Vercel

1. Suba o projeto para um repositorio Git.
2. Importe o repositorio na Vercel.
3. Configure a variavel `NEXT_PUBLIC_WHATSAPP_NUMBER` no painel do projeto.
4. Execute o deploy.

Observacao: variaveis com prefixo `NEXT_PUBLIC_` entram no bundle do cliente, entao qualquer mudanca no numero exige novo build/deploy.

## Observacoes de acessibilidade

- Contraste forte entre texto e fundo
- Labels sempre visiveis no checkout
- Foco visivel em teclado
- Controles com altura minima de 44px
- Movimento reduzido respeitado via Motion e `prefers-reduced-motion`
- Layout preparado para funcionar bem com zoom do navegador e ajuste de fonte
