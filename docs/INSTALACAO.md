# Instalação local — Monezy B2B

## 1. Pré-requisitos
Instale Node.js 22 ou superior, npm e Google Chrome para testar a versão web. Para testar opcionalmente no celular, instale Expo Go. Para Android nativo, configure Android Studio; para iOS nativo, é necessário macOS e Xcode.

## 2. Instalar dependências
Na raiz do repositório, instale os workspaces com:

```bash
npm ci
```

O Expo Router, React Native Paper e Firebase Client estão declarados em `front-end/package.json`; Express e Firebase Admin, em `server/package.json`. Não instale NativeWind, Tailwind ou Zustand.

## 3. Configurar frontend
Crie `front-end/.env` a partir do exemplo e preencha a configuração do aplicativo Web Firebase e a URL da API:

```bash
cp front-end/.env.example front-end/.env
```

No PowerShell:
```powershell
Copy-Item front-end/.env.example front-end/.env
```

Ative o método de autenticação e-mail/senha no Firebase Console e confira em **Authentication → Settings → Authorized domains** que `localhost` está autorizado. As variáveis `EXPO_PUBLIC_*` são incluídas no bundle do app: não coloque segredos administrativos nelas. Para testar em um aparelho físico, troque `localhost` em `EXPO_PUBLIC_API_URL` pelo endereço IP local do computador.

## 4. Configurar backend
Crie `server/.env` a partir do exemplo:

```bash
cp server/.env.example server/.env
```
Configure `FIREBASE_PROJECT_ID` e uma credencial Firebase Admin. Prefira ADC local configurado por `gcloud auth application-default login`, com permissões IAM adequadas, ou `GOOGLE_APPLICATION_CREDENTIALS` apontando para um arquivo ADC/JSON protegido fora do repositório. `FIREBASE_SERVICE_ACCOUNT_JSON` também é suportado, mas não coloque a chave no app nem versione o arquivo. `CORS_ORIGIN` aceita uma lista de origens separadas por vírgula. Em desenvolvimento, pode-se usar o emulador Firestore com `FIRESTORE_EMULATOR_HOST`.

O exemplo inclui as duas variáveis de credenciais vazias. Configure somente uma. Para usar ADC por arquivo local, defina `GOOGLE_APPLICATION_CREDENTIALS` com o caminho absoluto do arquivo de chave, guardado fora do repositório. O app de demonstração não precisa de uma chave administrativa em `front-end/.env`.

O projeto Firebase esperado é `app-financas-61857`. O ID já está nos exemplos de ambiente; preencha as demais configurações do app Web em `front-end/.env` e configure as credenciais administrativas apenas no backend.

Crie `users/{uid}` no Firestore para cada usuário permitido e associe `companyId`. Em `companies/{companyId}/accounts/{accountId}`, configure `name`, `creditLimit`, `usedLimit` e, opcionalmente, `currency`. A identidade da empresa vem do perfil lido pelo servidor; o cliente não pode escolher outra empresa.

As regras são negadas por padrão porque os clientes não executam operações de negócio diretamente no Firestore. Para publicar somente os índices configurados (sem alterar regras), use uma conta com permissão `datastore.indexes.create`:

```bash
firebase deploy --only firestore:indexes --project app-financas-61857
```

O histórico por conta consulta `accountId` e ordena os resultados no backend, portanto não depende do índice composto. O índice de `transactions` em `firebase/firestore.indexes.json` pode ser publicado separadamente para futuras consultas ordenadas no Firestore.

## 5. Iniciar no Chrome
Em terminais separados, na raiz do repositório:

```bash
npm run start:server
```

No terminal do frontend:

```bash
cd front-end
npx expo start --web
```

Abra a URL web exibida pelo Expo (normalmente `http://localhost:8081`). Não execute `npx expo start` na raiz, pois o app Expo está em `front-end/`. Se a porta 8081 já estiver em uso, encerre o Metro anterior com `Ctrl+C` ou use a porta informada pelo Expo. Para limpar o cache:

```bash
npx expo start --web --clear
```

Para executar opcionalmente no Expo Go, inicie pelo workspace na raiz:

```bash
npm run start --workspace @monezy/front-end -- --lan
```

## 6. Testes e problemas comuns
Execute `npm test` na raiz para os testes HTTP do backend. Sem credenciais Firebase, a API inicia e responde no endpoint `/health`, mas chamadas protegidas retornam `FIREBASE_NOT_CONFIGURED`.

- `Unable to resolve module`: execute `npm ci` na raiz e reinicie o Expo.
- API inacessível no aparelho físico: confira o IP configurado em `EXPO_PUBLIC_API_URL`, a rede local e `CORS_ORIGIN`.
- Firebase sem configuração: copie a API key do app Web existente pelo Firebase Console para `EXPO_PUBLIC_FIREBASE_API_KEY` em `front-end/.env` e reinicie o Metro; não envie esse valor pelo chat. Configure credenciais Admin localmente apenas no servidor.
- Firebase sem configuração: confira os arquivos `.env` de cada workspace e reinicie o Expo/servidor.
- `COMPANY_ACCESS_REQUIRED`: crie o documento `users/{uid}` e defina seu `companyId`.
- O dashboard mostra erro em vez de substituir falhas da API por limites fictícios. O modo demonstração é explícito e não persiste movimentações.
- A consulta real ao Firestore requer Authentication configurado no frontend e credenciais Firebase Admin no backend; sem elas, endpoints protegidos respondem com erro, não com dados de demonstração.

## 7. Demonstração e recurso nativo
No Chrome, pressione **F12** e ative **Toggle device toolbar** para verificar as telas em larguras mobile. Entre com o usuário de teste do Firebase (não escolha o modo demonstração), consulte os limites, registre uma movimentação com valor fictício, edite-a, exclua-a e confirme a atualização do limite. O app usa `expo-haptics` para emitir feedback tátil quando uma nova movimentação é registrada com sucesso. Esse recurso precisa ser demonstrado em dispositivo compatível ou build nativo; não pode ser validado pelo DevTools mobile do Chrome ou apenas pelos testes automatizados.

## 8. Nota sobre operações
Movimentações apenas simulam o uso do limite empresarial. Nenhuma transação bancária real é processada.
