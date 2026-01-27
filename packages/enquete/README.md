# Enquete Widget

A form-based survey/enquete widget for citizen participation.

## Local Development

To test this widget on your local machine:

1. In the root of the `packages/enquete` widget, create a `.env.local` file:
```
VITE_API_URL="http://localhost:31410"
VITE_PROJECT_ID="<your project id>"
```

2. Run `npm run dev` from the package directory.

If you want to use more custom Vite env variables, add these to `vite-env.d.ts` for better type hinting.

## Draft Persistence

The Enquete widget automatically saves user input to `localStorage`, allowing users to resume filling out the form if they navigate away and return later.

### How it works

- Draft data is saved per browser/device using a unique key: `enquete-draft:{projectId}:{widgetId}:{pathname}`
- Saving is debounced (750ms delay) to avoid excessive writes
- Drafts are automatically restored when the user returns to the same page
- On successful submission, the draft is cleared
- If `localStorage` is unavailable (private browsing, storage blocked), the widget functions normally without persistence

### Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableDraftPersistence` | `boolean` | `true` | Enable/disable automatic draft saving |
| `draftRetentionHours` | `number` | `24` | Hours before a draft expires and is deleted |

These settings can be configured in the admin panel under the Enquete widget's "Algemeen" (General) tab.

### Storage key structure

The storage key ensures drafts don't conflict across:
- Different projects (`projectId`)
- Different widgets on the same project (`widgetId`)
- Same widget embedded on different pages (`pathname`)

### Privacy considerations

Draft data is stored locally in the user's browser and is never sent to the server until form submission. Consider disabling draft persistence for forms collecting highly sensitive information.
