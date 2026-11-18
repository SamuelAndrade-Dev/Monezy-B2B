# Instalação local — Monezy B2B

## 1. Pré-requisitos
Instale Node.js 22 ou superior e npm. Para testar no celular, instale Expo Go. Para Android nativo, configure Android Studio; para iOS nativo, é necessário macOS e Xcode.

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

Ative o método de autenticação e-mail/senha no Firebase Console. As variáveis `EXPO_PUBLIC_*` são incluídas no bundle do app: não coloque segredos administrativos nelas. Para testar em um aparelho físico, troque `localhost` em `EXPO_PUBLIC_API_URL` pelo endereço IP local do computador.

## 4. Configurar backend
Crie `server/.env` a partir do exemplo:

```bash
cp server/.env.example server/.env
```
Configure `FIREBASE_PROJECT_ID` e uma credencial Firebase Admin fora do repositório: `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON em uma única variável) ou `GOOGLE_APPLICATION_CREDENTIALS` (caminho protegido para arquivo de credenciais). Nunca coloque essa credencial no app ou versione o arquivo. `CORS_ORIGIN` aceita uma lista de origens separadas por vírgula. Em desenvolvimento, pode-se usar o emulador Firestore com `FIRESTORE_EMULATOR_HOST`.

O projeto Firebase esperado é `app-financas-61857`. O ID já está nos exemplos de ambiente; preencha as demais configurações do app Web em `front-end/.env` e configure as credenciais administrativas apenas no backend.

Crie `users/{uid}` no Firestore para cada usuário permitido e associe `companyId`. Em `companies/{companyId}/accounts/{accountId}`, configure `name`, `creditLimit`, `usedLimit` e, opcionalmente, `currency`. A identidade da empresa vem do perfil lido pelo servidor; o cliente não pode escolher outra empresa.

As regras são negadas por padrão porque os clientes não executam operações de negócio diretamente no Firestore. Para publicar regras e índices com Firebase CLI:

```bash
firebase deploy --only firestore
```

## 5. Iniciar
Em terminais separados:

```bash
npm run start:server
npm start
```

Leia o QR Code com Expo Go. Para limpar o cache:
```bash
npm run start --workspace @monezy/front-end -- --clear
```

## 6. Testes e problemas comuns
Execute `npm test` na raiz para os testes HTTP do backend. Sem credenciais Firebase, a API inicia e responde no endpoint `/health`, mas chamadas protegidas retornam `FIREBASE_NOT_CONFIGURED`.

- `Unable to resolve module`: execute `npm install` na raiz e reinicie o Expo.
- API inacessível no aparelho físico: confira o IP configurado em `EXPO_PUBLIC_API_URL`, a rede local e `CORS_ORIGIN`.
- Firebase sem configuração: confira os arquivos `.env` de cada workspace e reinicie o Expo/servidor.
- `COMPANY_ACCESS_REQUIRED`: crie o documento `users/{uid}` e defina seu `companyId`.
- O dashboard mostra erro em vez de substituir falhas da API por limites fictícios. O modo demonstração é explícito e não persiste movimentações.

## 7. Demonstração e recurso nativo
Entre com o usuário de teste, consulte os limites, registre uma movimentação com valor fictício, edite-a, exclua-a e confirme a atualização do limite. O app usa `expo-haptics` para emitir feedback tátil quando uma nova movimentação é registrada com sucesso. Esse recurso precisa ser demonstrado em dispositivo compatível ou build nativo; a verificação de execução física não pode ser feita apenas pelos testes automatizados.

## 8. Nota sobre operações
Movimentações apenas simulam o uso do limite empresarial. Nenhuma transação bancária real é processada.
