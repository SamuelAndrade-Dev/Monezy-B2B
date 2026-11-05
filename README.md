# Monezy B2B

Aplicativo acadêmico de consulta e simulação de limite empresarial. Projeto em **JavaScript**, React Native e Expo.

## Requisitos
- Node.js LTS
- npm
- Expo Go no celular ou emulador Android/iOS
- Projeto Firebase `app-financas-61857`

## Instalação
Consulte `docs/INSTALACAO.md`. As dependências nativas devem ser instaladas com `npx expo install` para obter versões compatíveis com o SDK Expo instalado.

## Executar
```bash
npx expo start
```

## Estrutura
- `app/`: rotas Expo Router
- `src/components/`: componentes reutilizáveis
- `src/services/`: Firebase e API HTTP
- `src/store/`: estado global Zustand
- `src/theme/`: tema React Native Paper
- `docs/`: instruções de instalação e configuração

## Importante
O app é uma simulação acadêmica. Não processa pagamentos nem movimenta dinheiro real. Configure as regras do Firestore antes de usar dados reais.
