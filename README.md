# Cala — Living Roman City Builder

Cala is a modern, artistic Roman city-building prototype. Build one block at a time and let layouts become streets, entrance courts, and gardens.

## Publish to GitHub Pages

The repository contains an automatic GitHub Pages workflow.

1. **Upload** the single file `Cala_GitHub_Pages_Ready.zip` into the repository's top-level folder (not inside another folder). The workflow extracts it when deploying. Do not unzip it on your phone.
2. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Open **Actions → Publish Cala to GitHub Pages** and check the latest run. If required, use **Run workflow**.
4. Once the workflow succeeds, play Cala at **https://tywgarvin-maker.github.io/Cala/** in Safari.

After the first upload, source files can be edited and deployed through GitHub. This website is **separate from the original ChatGPT Sites version**; browser save data does not transfer automatically.

Current features: single-block building, Undo, paths and trees, example layouts for boulevard, entrance court and peristyle garden. People and walk mode are future development goals.

## Source

The ZIP contains HTML5 Canvas source, Javascript, and painted artwork; there is no server dependency. The GitHub Pages workflow prefers editable root source files when they are present, and otherwise extracts the site from the ZIP.
