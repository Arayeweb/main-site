# Telegram Bot UX — Manual QA Checklist

## Setup
- [ ] Bot webhook points to `/api/telegram/webhook`
- [ ] `TELEGRAM_BOT_TOKEN` is configured
- [ ] Test with a fresh Telegram account or cleared session

## Core flows

### /start
- [ ] `/start` shows welcome message with main menu keyboard
- [ ] Welcome copy guides the user to press چت سریع and pick a model
- [ ] Forced join gate still works when channels are required

### Unified chat entry
- [ ] Sending any text before a model is selected shows the model picker (AI is NOT called)
- [ ] After selecting a model, the same text flow reaches the AI
- [ ] No implicit economy fallback when no model is chosen

### Main menu
- [ ] Main menu shows: چت سریع، مقایسه، همفکری، خرید اعتبار، پشتیبانی، پاک کردن تاریخچه
- [ ] Pressing **بازگشت** edits the current menu message instead of spamming new menus

### Quick Chat
- [ ] Press **چت سریع** → model picker appears
- [ ] Model buttons show all 4 models + بازگشت

### Model selection
- [ ] Select a **free model** → old model buttons disappear
- [ ] Confirmation is short, e.g. `GPT-4o mini فعاله. سوالت را بفرست.`
- [ ] State is saved (`mode: quick_chat`, `selectedModel`, `selectedAt`)
- [ ] Select a **paid model without credits** → short insufficient-credit message + buy credit button
- [ ] AI is **not** called when credits are insufficient

### Chat response lifecycle
- [ ] Send a simple question after model selection
- [ ] Loading message `⏳ دارم فکر می‌کنم...` appears immediately (before quota/history reads)
- [ ] While the model streams, the loading message updates progressively (throttled ~1s)
- [ ] Loading message is **edited** into the final answer (no separate answer message)
- [ ] Final answer is short and Persian-first, same tone as the web (Arena) direct chat
- [ ] Simple greetings ("سلام") go through the model too (no hardcoded shortcut reply)
- [ ] No extra compare CTA message after every answer
- [ ] Insufficient-credit / limit messages replace the loading message (no stuck `⏳`)

### Paid model with credits
- [ ] Select paid model with enough credit
- [ ] Send question → loading message → edited answer
- [ ] Credits are deducted as before

### Insufficient credit during chat
- [ ] Exhaust free quota / credits
- [ ] Send question → short limit message + buy credit button
- [ ] No stuck loading message

### Back to menu
- [ ] From model picker, press **بازگشت**
- [ ] Current message is replaced with main menu (not a new message)

### Clear history
- [ ] Press **پاک کردن تاریخچه**
- [ ] One short confirmation message ("همین مدل فعاله — سوال بعدی را بفرست")
- [ ] Chat context cleared; selected model and state preserved (no re-pick needed)
- [ ] Payment history untouched

## Error handling

### AI provider error
- [ ] Simulate provider failure / timeout
- [ ] Loading message becomes: `مشکلی پیش اومد. دوباره امتحان کن.` or timeout copy
- [ ] No forever-stuck loading message

### Very long AI answer
- [ ] Ask for a long response
- [ ] First chunk replaces loading message
- [ ] Remaining chunks arrive as continuation messages only

### editMessageText fallback
- [ ] If edit fails (old message), bot falls back to `sendMessage`
- [ ] User still receives the answer

## Callback UX
- [ ] Every inline button click is acknowledged (`answerCallbackQuery`)
- [ ] Previous inline keyboard is removed or replaced after selection
- [ ] No leftover model/menu buttons after state change

## Regression checks (must not change)
- [ ] Payment flow still works
- [ ] Credit deduction unchanged
- [ ] Model prices unchanged
- [ ] Authentication unchanged
- [ ] Web app unaffected
