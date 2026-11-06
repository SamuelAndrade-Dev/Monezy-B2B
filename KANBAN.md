# Monezy B2B — Quadro de acompanhamento (auditoria em 06/11/2026)

> Este arquivo é um **espelho manual** do andamento comprovado no repositório e **não atualiza automaticamente o GitHub Projects**. O quadro nativo deve ser sincronizado pelos integrantes. Nenhuma issue está totalmente concluída segundo os critérios de aceite.

## Em andamento — há código parcial, mas falta validação (11)
- [#1 — Inicializar Expo e JavaScript](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/1)
- [#3 — Organizar Git Flow e PRs](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/3)
- [#4 — Configurar NativeWind/Paper e tema](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/4)
- [#5 — Implementar navegação Expo Router](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/5)
- [#6 — Integrar Firebase e Firestore](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/6)
- [#9 — Integrar Zustand às telas](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/9)
- [#10 — Criar dashboard financeiro dinâmico](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/10)
- [#11 — Exibir histórico e filtros](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/11)
- [#12 — Concluir CRUD de gastos simulados](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/12)
- [#13 — Integrar API REST às telas](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/13)
- [#15 — Conectar e editar perfil](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/15)

## A fazer — prioridades imediatas (3)
- [#21 — Corrigir dependências e validar Expo](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/21)
- [#16 — Proteger dados com regras Firestore](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/16)
- [#2 — Definir MVP e regras do limite empresarial](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/2)

## Backlog — tarefas não iniciadas ou sem evidência de implementação (6)
- [#7 — Modelar coleções e dados de demonstração](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/7)
- [#8 — Implementar autenticação](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/8)
- [#14 — Adicionar recurso nativo](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/14)
- [#17 — Validar responsividade e UX](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/17)
- [#18 — Testar fluxos em aparelho](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/18)
- [#19 — Preparar documentação e apresentação](https://github.com/SamuelAndrade-Dev/Monezy-B2B/issues/19)

## Em revisão
- Relatório desta auditoria submetido por PR de documentação; as issues de funcionalidades ainda não foram movidas para revisão.

## Concluído
- Nenhuma issue foi encerrada automaticamente: a execução local, os testes e as revisões por colegas ainda exigem comprovação.

## Evidências e bloqueios
- O PR [#20](https://github.com/SamuelAndrade-Dev/Monezy-B2B/pull/20) foi **mesclado em `develop`**, incluindo rotas, componentes, configuração de Firebase, serviços Firestore, Zustand e exemplo de Fetch.
- `main` contém só o README inicial; o código está em `develop`.
- O `package.json` não declara dependências, embora `package-lock.json` liste pacotes e tenha nome de projeto diferente (`Trab`). **Issue #21 bloqueia validação da execução.**
- O dashboard exibe valores fictícios estáticos. A tela de movimentações tem leitura e criação no Firestore, mas não edição/exclusão; a integração funcional com credenciais reais não foi comprovada.
- `src/services/api.js` contém Fetch de exemplo, ainda sem uso na UI.
- A coleção Firestore global `transactions` exige regras de acesso e modelagem de separação por usuário/empresa antes de compartilhar dados.
- O PR #20 não apresenta revisão registrada por outro integrante; revisar PRs futuros para atender ao professor.

## Fluxo do trio
1. Atualizar o GitHub Projects com as posições acima, se as issues já estiverem vinculadas ao Board.
2. Escolher responsáveis para as issues e distribuir contribuições entre os três integrantes.
3. Desenvolver a partir de `develop` em branches `feature/*` (e `docs/*` para documentação).
4. Abrir PR para `develop`, solicitar revisão de outro membro e registrar evidências de teste.
5. Só fechar uma issue após cumprir todos os critérios de aceite e validar no aplicativo.

**Análise técnica detalhada:** [docs/STATUS-2026-11-06.md](docs/STATUS-2026-11-06.md).
