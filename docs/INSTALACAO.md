# Instalação local — Monezy B2B

## 1. Pré-requisitos
Instale Node.js LTS e npm. Para testar no celular, instale Expo Go. Para Android nativo, configure Android Studio; para iOS nativo, é necessário macOS e Xcode.

## 2. Instalar dependências
Abra o terminal dentro da pasta `monezy-b2b` e execute:

```bash
npm install
npx expo install expo-router expo-constants expo-linking expo-status-bar react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-svg
npx expo install firebase
npx expo install react-native-paper react-native-safe-area-context
npm install zustand
npm install nativewind
npm install -D tailwindcss@^3.4.17
```

Se o Expo indicar dependências incompatíveis, execute:
```bash
npx expo install --fix
```

## 3. Configurar Firebase
1. Abra https://console.firebase.google.com/project/app-financas-61857/overview
2. Em Configurações do projeto > Geral, registre um aplicativo Web para obter as credenciais.
3. Ative Authentication (E-mail/senha) se o fluxo de login for utilizado.
4. Crie o Firestore Database.
5. Copie `.env.example` para `.env` e preencha os valores da configuração Web:

```bash
cp .env.example .env
```

No PowerShell:
```powershell
Copy-Item .env.example .env
```

As variáveis `EXPO_PUBLIC_*` são incorporadas ao app. Não coloque senhas, chaves privadas ou credenciais de servidor nelas. A API key do Firebase Web identifica o projeto; a segurança deve ser feita com Authentication e regras do Firestore.

## 4. Iniciar
```bash
npx expo start
```
Leia o QR Code com Expo Go. Para limpar o cache:
```bash
npx expo start -c
```

## 5. Problemas comuns
- `Unable to resolve module`: rode `npm install` e reinicie com `npx expo start -c`.
- Dependências nativas incompatíveis: rode `npx expo install --fix`.
- Firebase sem configuração: confira o arquivo `.env` e reinicie o Metro.
- NativeWind sem estilos: confira `babel.config.js`, `metro.config.js`, `tailwind.config.js` e `global.css`.

## 6. Nota sobre SDK
O Expo evolui frequentemente. Por isso, use `npx expo install` para módulos compatíveis com o SDK instalado, em vez de fixar manualmente versões de bibliotecas nativas.
