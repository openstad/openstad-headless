# Collapse a fully-selected tag type into one label on the resource-detail page

**Date:** 2026-06-17
**Status:** Approved

## Problem

On a resource form, a tag field (type `tags`) can offer a "Selecteer alles" (Select all)
checkbox with a custom label (e.g. `helestad`). Ticking it stores **all** of the real tags
of that type (e.g. all `staddelen` districts) on the resource — the `select_all` value itself
is never persisted (see `packages/ui/src/form-elements/checkbox/index.tsx:290-320`).

On the resource-detail page, the Tags section therefore lists every individual district pill
and never shows the "helestad" label, because `helestad` is not a tag. Users want: when a
resource has the whole set, show a single label pill instead of the full list.

## Behavior

When a resource has **every** tag of a configured tag type, the detail page's Tags section
renders **one** pill with a custom label, dropping the individual pills of that type. Tags of
other types render unchanged. If only some tags of that type are selected, they render
individually as today.

## Components

### 1. Admin config — resourcedetail "Weergave" (Display) tab

File: `apps/admin-server/src/pages/projects/[project]/widgets/resourcedetail/[id]/display.tsx`

Two new optional fields:

- **`collapseTagType`** — `Select` dropdown of the project's tag types, built like the form's
  "Welk type tag" dropdown: `useTags(project)` → unique `type`s
  (`apps/admin-server/src/pages/projects/[project]/widgets/resourceform/[id]/items.tsx:1404`).
  Includes a "Geen / uit" option (value `''`) to disable.
- **`collapseTagLabel`** — text input for the replacement label (e.g. `helestad`).

zod schema additions:

```ts
collapseTagType: z.string().optional(),
collapseTagLabel: z.string().optional(),
```

Defaults read `props?.collapseTagType ?? ''` and `props?.collapseTagLabel ?? ''`.

### 2. Props / types — resource-detail

File: `packages/resource-detail/src/resource-detail.tsx`

Add to `ResourceDetailWidgetProps` and the component destructure:

```ts
collapseTagType?: string;
collapseTagLabel?: string;
```

### 3. Widget render — Tags block (~line 688)

File: `packages/resource-detail/src/resource-detail.tsx`

- Add an unconditional top-level hook:
  `const { data: collapseTags } = datastore.useTags({ projectId, type: collapseTagType });`
  (Hooks must be called unconditionally. When `collapseTagType` is empty the result is unused.)
- Replace the inline tags render with:

```
base       = resource.tags.filter(t => t.type !== 'status')
ofType     = base.filter(t => t.type === collapseTagType)
collapse   = !!collapseTagType && !!collapseTagLabel
             && Array.isArray(collapseTags) && collapseTags.length > 0
             && ofType.length === collapseTags.length

if collapse:
  render <Pill text={collapseTagLabel} />  +  base.filter(t => t.type !== collapseTagType) sorted by seqnr
else:
  render base sorted by seqnr   (current behavior)
```

### 4. Frontend defaults

The resourcedetail `defaultConfig` in
`apps/api-server/src/routes/widget/widget-settings.js` only contains
`projectId: null` — display fields (e.g. `displayTags`) are **not** listed there and
rely on the widget component's own parameter defaults. To stay consistent with that
pattern, the new keys are **not** added to `widget-settings.js`; the component defaults
(`collapseTagType = ''`, `collapseTagLabel = ''`) cover the "feature off" case.

## Edge cases

- `collapseTags.length === 0` → never collapse (avoids collapsing during load / empty type).
- `collapseTagType` set but `collapseTagLabel` empty → behaves normally (no collapse).
- Status tags remain excluded (`type !== 'status'`).
- A type with exactly 1 tag, selected, counts as "all" and collapses. Accepted (matches
  select-all semantics); a `> 1` guard can be added later if undesired.
- If a new tag of the type is later added, older "all" resources no longer match and expand
  to individual pills — correct, since they no longer hold the full set.

## Testing

Playwright (WebKit) against the local admin preview at
`/projects/2/widgets/resourcedetail/3`:

1. With `collapseTagType=staddelen`, `collapseTagLabel=helestad` and a resource holding all
   `staddelen` tags → exactly one `helestad` pill, no individual district pills.
2. Remove one district tag (partial) → individual pills return, no `helestad` pill.
3. Feature off (`collapseTagType=''`) → unchanged from current behavior.
