# Monezy B2B

Aplicativo acadêmico de consulta e simulação de limite empresarial. Projeto em **JavaScript**, React Native e Expo.

## Situação do projeto (06/11/2026)
A estrutura e as telas iniciais estão na branch `develop`, mas a execução em Expo Go/emulador e a conexão real com Firestore **ainda precisam ser validadas**. Há um bloqueio de consistência de dependências registrado na [issue #21](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/21).

- [Relatório detalhado de progresso](docs/STATUS-2026-11-06.md)
- [Kanban manual atualizado](KANBAN.md)
- [Issues e tarefas](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues)

## Requisitos
- Node.js LTS
- npm
- Expo Go no celular ou emulador Android/iOS
- Projeto Firebase `app-financas-61857`

## Instalação
Consulte `docs/INSTALACAO.md`. **Atenção:** até a resolução da issue #21, as dependências do `package.json` não estão consistentes com o arquivo de lock. Não considerar a execução como testada.

## Executar (depois de corrigir as dependências)
```bash
npx expo start
```

## Estrutura
- `app/`: rotas Expo Router
- `src/components/`: componentes reutilizáveis
- `src/services/`: Firebase e API HTTP
- `src/store/`: estado global Zustand
- `src/theme/`: tema React Native Paper
- `docs/`: instruções, configuração e auditorias

## Fluxo de trabalho
Usar `main` para a versão estável; criar funcionalidades em branches a partir de `develop` e abrir Pull Requests com revisão de outro integrante antes de mesclar.

## Importante
O app é uma simulação acadêmica. Não processa pagamentos nem movimenta dinheiro real. Configure autenticação e regras de segurança do Firestore antes de compartilhar dados de usuários.
