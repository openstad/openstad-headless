export function elipsize(value: string, maxLength: number) {
  if (value.length > maxLength) {
    return value.substring(0, maxLength) + '...';
  }
  return value;
}

function truncateNode(
  node: Node,
  maxLength: number,
  currentLength: { value: number }
): string {
  let truncatedHTML = '';

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue || '';
    if (currentLength.value + text.length > maxLength) {
      truncatedHTML += text.substring(0, maxLength - currentLength.value) + '...';
      currentLength.value = maxLength;
    } else {
      truncatedHTML += text;
      currentLength.value += text.length;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.nodeName.toLowerCase();
    truncatedHTML += `<${tagName}`;

    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      truncatedHTML += ` ${attr.name}="${attr.value}"`;
    }
    truncatedHTML += '>';

    for (let i = 0; i < element.childNodes.length; i++) {
      if (currentLength.value >= maxLength) break;
      truncatedHTML += truncateNode(element.childNodes[i], maxLength, currentLength);
    }

    truncatedHTML += `</${tagName}>`;
  }

  return truncatedHTML;
}

export function elipsizeHTML(value: string, maxLength: number): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value;

  let currentLength = { value: 0 };
  let truncatedHTML = '';

  for (let i = 0; i < tempDiv.childNodes.length; i++) {
    if (currentLength.value >= maxLength) break;
    truncatedHTML += truncateNode(tempDiv.childNodes[i], maxLength, currentLength);
  }

  return truncatedHTML;
}