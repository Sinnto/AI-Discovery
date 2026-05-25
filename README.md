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

- The memory stream shows only real submitted memories; if none exist, it shows an empty state.
- The upload form saves new memories directly to the configured Supabase project.
- Media files upload to the `lulu-memories` Supabase Storage bucket.
- Uploaded images also generate a lightweight transparent PNG cutout specimen in the browser and upload it to Storage.
- If Supabase is unavailable, the submitted memory is saved in the current browser as a fallback.
- The AI cutout pipeline is simulated through a short processing overlay and generated specimen labels.

## Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor before sharing the page.

The frontend expects:

- Table: `public.memories`
- Public storage bucket: `lulu-memories`
- Anonymous read and insert policies for the farewell page

Existing Supabase projects should re-run the SQL after updates so the `cutout_url`, `cutout_path`, and `cutout_label` columns are present.

## Production Notes

The production version should add private sharing, moderation, upload size limits, and a model-backed visual pipeline for true person/object segmentation. The current cutout is a browser-generated transparent specimen treatment, not semantic segmentation.
