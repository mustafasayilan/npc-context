# VamaoLabs NPC Context Turkce Ozet

VamaoLabs NPC Context, Codex ve Claude Code gibi AI coding agent'lar icin yerel, dusuk-token bir baglam katmanidir.

Amaci agent'in tum repoyu bastan okumasi yerine once kucuk ve goreve odakli bir `.npc-context/task-context.md` dosyasi uretmektir.

## Kurulum

GitHub uzerinden:

```bash
npm install -g mustafasayilan/npc-context
```

## Kullanim

```bash
npc-context init --project --agent both
npc-context context "login hatasini duzelt" --root .
```

Global kurulum:

```bash
npc-context install --global --agent both
```

## Not

Token rakamlari yaklasik yerel tahminlerdir. Fatura garantisi degildir.

Bu arac garanti olmadan, oldugu gibi sunulur. Kullanmadan once uretilen dosyalari ve agent degisikliklerini inceleyin.
