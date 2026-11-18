# Monezy B2B

Aplicativo acadêmico para consultar limites empresariais e registrar movimentações simuladas. O frontend usa React Native, Expo Router e React Native Paper; o backend usa Node.js, Express, Firebase Admin e Cloud Firestore.

## Requisitos

- Node.js 22 ou superior e npm
- Expo Go ou emulador Android/iOS
- Um projeto Firebase com Authentication (e-mail/senha) e Firestore habilitados

## Instalação e execução

Consulte [docs/INSTALACAO.md](./docs/INSTALACAO.md). Na raiz:

```bash
npm ci
npm run start:server
npm start
```

## Executar em outro computador

1. Instale Git, Node.js 22 ou superior e npm; para testar no celular, instale Expo Go. Clone o repositório e entre na pasta do projeto.
2. Instale as dependências e crie os arquivos locais de configuração:

   ```bash
   npm ci
   cp front-end/.env.example front-end/.env
   cp server/.env.example server/.env
   ```

   No Windows PowerShell, use `Copy-Item front-end/.env.example front-end/.env` e `Copy-Item server/.env.example server/.env`.
3. No `front-end/.env`, preencha os valores da aplicação Web Firebase (`EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID` e `EXPO_PUBLIC_FIREBASE_APP_ID`). Para consultar os valores, use **Configurações do projeto → Geral → Seus apps** no Firebase Console. A API key do Firebase Client não é uma credencial administrativa; nunca coloque chaves privadas nas variáveis `EXPO_PUBLIC_*`.
4. No `server/.env`, mantenha o Project ID e configure **uma** forma de credencial Admin: `GOOGLE_APPLICATION_CREDENTIALS` com o caminho absoluto para o arquivo JSON privado, ou `FIREBASE_SERVICE_ACCOUNT_JSON`. Prefira guardar o arquivo fora do repositório. Não envie nem versione o arquivo ou seu conteúdo.
5. Se o Expo Go estiver em outro dispositivo, conecte-o à mesma rede Wi-Fi do computador que executa o backend. Descubra o IP local desse computador e configure no `front-end/.env`:

   ```env
   EXPO_PUBLIC_API_URL=http://<IP_LOCAL_DO_COMPUTADOR>:3000/api/v1
   ```

   Para encontrar o IP: no Windows, execute `ipconfig` e use o IPv4 do Wi-Fi; no macOS, `ipconfig getifaddr en0`; no Linux, `hostname -I`. `localhost` só serve quando o cliente e a API estão no mesmo computador. O IP pode mudar ao trocar de rede; atualize essa variável e reinicie o Expo. Permita conexões locais na porta `3000` no firewall, se solicitado.
6. Inicie os processos em terminais separados:

   ```bash
   npm run start:server
   npm run start --workspace @monezy/front-end -- --lan
   ```

   Confirme a API abrindo `http://<IP_LOCAL_DO_COMPUTADOR>:3000/health`, depois leia o QR Code com Expo Go. As variáveis `.env` são locais e precisam ser configuradas separadamente em cada computador.

## Demonstração acadêmica

1. Inicie o backend e o Expo conforme [docs/INSTALACAO.md](./docs/INSTALACAO.md).
2. Entre com o usuário de teste configurado no Firebase Authentication.
3. Confira o limite total, utilizado e disponível no dashboard; use **Atualizar resumo** para buscar novamente pela API.
4. Registre uma movimentação com descrição e valor fictício. Em dispositivo compatível, o app emite feedback tátil após a resposta bem-sucedida da API.
5. Edite e exclua a movimentação e confira o histórico e o limite atualizado.
6. Abra o perfil e encerre a sessão.

O modo demonstração usa indicadores fictícios e não persiste movimentações. A validação de haptics em um aparelho físico ainda depende de execução local com Expo Go ou build nativo.

O frontend e o backend são workspaces npm independentes. Configure as variáveis de ambiente em `front-end/.env` e `server/.env` antes de usar os serviços Firebase e a API.

## Estrutura

- `front-end/app/`: rotas Expo Router (Stack, autenticação e Tabs)
- `front-end/src/features/`: telas de autenticação, dashboard, movimentações e perfil
- `front-end/src/components/`: componentes React Native Paper reutilizáveis e layout
- `front-end/src/contexts/`: sessão Firebase Authentication
- `front-end/src/services/`: cliente Fetch autenticado e Firebase Authentication
- `server/src/modules/`: rotas, controllers, regras de negócio e repositórios
- `firebase/`: regras e índices Firestore
- `docs/`: configuração e instruções do projeto

## Dados e segurança

O usuário autenticado precisa ter um documento `users/{uid}` com `companyId`. Contas ficam em `companies/{companyId}/accounts/{accountId}` com `name`, `creditLimit`, `usedLimit` e, opcionalmente, `currency`. O backend armazena movimentações em `companies/{companyId}/transactions/{transactionId}`.

O app usa Firebase Authentication para sessão e token; operações de negócio passam pela API. Credenciais administrativas ficam somente no backend. As regras do Firestore negam acesso direto de clientes. As movimentações são simuladas e não iniciam transferências ou pagamentos reais.

Todos os endpoints abaixo exigem `Authorization: Bearer <Firebase ID token>`:

- `GET /api/v1/accounts` e `GET /api/v1/accounts/:accountId/limits`
- `GET /api/v1/transactions?accountId=:accountId`
- `POST /api/v1/transactions` com `{ "accountId": "…", "title": "…", "amount": 12.34 }`
- `PATCH /api/v1/transactions/:transactionId` com `title`, `amount` e/ou `category`
- `DELETE /api/v1/transactions/:transactionId` (resposta `204`)

Erros usam `{ "error": { "code": "…", "message": "…" } }`. As criações, edições e exclusões atualizam o limite e o registro de movimentação atomicamente.

## Comandos

```bash
npm test
npm run start:server
npm start
```
