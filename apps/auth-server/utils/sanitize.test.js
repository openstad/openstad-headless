import { expect, test } from "vitest";
import sanitize from './sanitize';

const stringWithoutTags = "Four dollar toast ethical YOLO butcher praxis raw denim. Roof party poke venmo, subway tile normcore bruh synth tumblr gluten-free activated charcoal biodiesel."
const stringWithSafeTags = "<h1>Four dollar</h1> <h2>toast</h2> <span>ethical</span> YOLO butcher praxis raw denim. Roof party poke venmo, subway tile normcore bruh synth tumblr gluten-free activated charcoal biodiesel."
const stringWithUnsafeTags = `<script src="https://api.openstad.org/widget/1" type="text/javascript"></script><h1>Four dollar</h1> <h2>toast</h2> <span>ethical</span> YOLO butcher praxis raw denim. Roof party poke venmo, subway tile normcore bruh synth tumblr gluten-free activated charcoal biodiesel.`

test('no-tags-sanitised text should have no tags', () => {
    expect(sanitize.noTags(stringWithoutTags)).toBe(stringWithoutTags)
    expect(sanitize.noTags(stringWithSafeTags)).toBe(stringWithoutTags)
    expect(sanitize.noTags(stringWithUnsafeTags)).toBe(stringWithoutTags)
})

test('safe-tags-sanitised text should have safe tags', () => {
    expect(sanitize.safeTags(stringWithoutTags)).toBe(stringWithoutTags)
    expect(sanitize.safeTags(stringWithSafeTags)).toBe(stringWithSafeTags)
    expect(sanitize.safeTags(stringWithUnsafeTags)).toBe(stringWithSafeTags)
})