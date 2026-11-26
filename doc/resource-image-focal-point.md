# Resource image focal point

Admins can set a focal point on each image of a resource. The focal point is the part of the image that must stay visible when a widget crops the image (grid cards, map cards, detail headers, budgeting lists).

- Stored per image as `resource.images[i].focalPoint = { x, y }`, both values 0-100 (percent from the left and the top). The API rounds and clamps the values.
- Widgets apply it as CSS `object-position` (through the shared `Image` component and `focalPointStyle`). Images without a focal point render as before (no `object-position`).
- Only editors and admins can set it. Moderators can only set it on their own resources: on someone else's resource the API keeps only `modBreaks` from a moderator's update, so the focal point is dropped without an error. The API strips `focalPoint` from requests of other users (for example residents editing their own resource), but a resident edit keeps a point that an admin already set.
- Set it in the admin resource form: button "Focuspunt instellen" next to an image, then drag the dot to the important part of the photo (or click it, use the arrow keys, or type the Left/Top percentages). A new crop clears the point and shows a hint to set it again.

## Carry-over rule

When a resource is saved, the focal point is kept for an image when the same `url` is still present. If the image is replaced or re-cropped (which produces a new `url`), the focal point is cleared and has to be set again.

## Export and import

The CSV/XLS export and import of resources does NOT include the focal point. Re-importing a resource does not restore it.
