import './index.css';

export function Text(props: React.HtmlHTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={props.className} />;
}

export function Heading(
  props: React.HtmlHTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
) {
  if (props.size === 'sm') {
    return <h3 {...props} className={props.className} />;
  } else if (props.size === 'md') {
    return <h2 {...props} className={props.className} />;
  } else {
    return <h1 {...props} className={props.className} />;
  }
}
