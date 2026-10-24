# Hieldt Rodrick

A small, soft-blue chat website for Jose, designed for GitHub Pages.

## Files
- `index.html` — chat layout
- `style.css` — responsive styling
- `bot.js` — message rendering, typing animation, local history, and keyword detection
- `responses.js` — editable keywords and reply variations
- `assets/rod.jpg` — add the intended profile image here

## Publish on GitHub Pages
1. Create a new public repository named `hieldt-rodrick`.
2. Upload all files and the `assets` folder to the repository root.
3. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save.
4. Wait for GitHub Pages to finish publishing.

## Add the profile image
Place the exact photo you want to use at `assets/rod.jpg`. Keep that filename so the page can find it.

## Notes
- No API key or paid AI API is used. Replies are selected from `responses.js` using keyword/phrase matching, so the bot cannot understand every unseen phrase like a real language model.
- To add a new phrase, add it to the appropriate `keywords` array in `responses.js`.
- Chat history is saved in local storage on the same browser/device. It does not sync between devices and can disappear if site data is cleared.
- Reopening the site with saved chat history shows the existing conversation without sending a new greeting.
- Clear chat asks for confirmation before deleting the saved conversation.
- The profile photo is not bundled because the intended user-provided image needs to be added as `assets/rod.jpg`.
