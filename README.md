# For Lulu, In Frames

A standalone web prototype for a departure memory-film gift.

## Open Locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

```bash
cd lulu-memory-film
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Prototype Behavior

- The memory stream is pre-seeded with five example memories.
- The upload form adds a new memory to the current browser session.
- Media files are previewed locally with `URL.createObjectURL`.
- The AI cutout pipeline is simulated through a short processing overlay and generated specimen labels.

## Production Notes

The production version would need backend storage, authentication or private sharing, moderation, and a real visual pipeline for scene understanding and transparent object/person cutouts.
