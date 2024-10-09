export function elipsize(value: string, maxLength: number) {
  if (value.length > maxLength) {
    return value.substring(0, maxLength) + '...';
  }
  return value;
}

export function elipsizeHTML(value: string, maxLength: number) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value;

  let currentLength = 0;
  let truncatedHTML = '';

  function truncateNode(node: any) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || '';
      if (currentLength + text.length > maxLength) {
        truncatedHTML += text.substring(0, maxLength - currentLength) + '...';
        currentLength = maxLength;
      } else {
        truncatedHTML += text;
        currentLength += text.length;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.nodeName.toLowerCase();
      truncatedHTML += `<${tagName}`;

      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        truncatedHTML += ` ${attr.name}="${attr.value}"`;
      }
      truncatedHTML += '>';

      for (let i = 0; i < node.childNodes.length; i++) {
        if (currentLength >= maxLength) break;
        truncateNode(node.childNodes[i]);
      }

      truncatedHTML += `</${tagName}>`;
    }
  }

  for (let i = 0; i < tempDiv.childNodes.length; i++) {
    if (currentLength >= maxLength) break;
    truncateNode(tempDiv.childNodes[i]);
  }

  return truncatedHTML;
}