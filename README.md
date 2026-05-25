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
- The upload form saves new memories to Supabase when the table and storage bucket are configured.
- Media files upload to the `lulu-memories` Supabase Storage bucket.
- If Supabase is unavailable, the submitted memory is saved in the current browser as a fallback.
- The AI cutout pipeline is simulated through a short processing overlay and generated specimen labels.

## Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor before sharing the page.

The frontend expects:

- Table: `public.memories`
- Public storage bucket: `lulu-memories`
- Anonymous read and insert policies for the farewell page

## Production Notes

The production version should add private sharing, moderation, upload size limits, and a real visual pipeline for scene understanding and transparent object/person cutouts.
