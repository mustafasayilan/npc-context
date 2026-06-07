# VamaoLabs NPC Context: краткое описание

VamaoLabs NPC Context - это локальный слой контекста с низким расходом токенов для AI coding agents, таких как Codex и Claude Code.

Инструмент создает небольшой файл `.npc-context/task-context.md`, чтобы агент сначала прочитал релевантную карту проекта, а не сканировал весь репозиторий.

## Установка

Из GitHub:

```bash
npm install -g https://github.com/mustafasayilan/npc-context/archive/refs/heads/main.tar.gz
```

## Использование

```bash
npc-context init --project --agent both
npc-context context "fix login validation bug" --root .
```

Глобальная установка инструкций:

```bash
npc-context install --global --agent both
```

## Важно

Оценки токенов являются локальными приблизительными расчетами и не являются гарантией стоимости API.

Инструмент предоставляется без гарантий. Проверяйте сгенерированные файлы и изменения, сделанные AI agent.
