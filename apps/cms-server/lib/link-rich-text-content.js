/** Returns the first rich-text item's content with image and permalink placeholders replaced. */
function linkRichTextContent(apos, area) {
  const item = area && area.items && area.items[0];

  if (!item || !item.content) {
    return '';
  }

  const richText = apos.modules['@apostrophecms/rich-text-widget'];
  const widget = { ...item };

  let content = richText.linkPermalinks(widget, item.content);
  content = richText.linkImages(widget, content);

  return content;
}

module.exports = { linkRichTextContent };
