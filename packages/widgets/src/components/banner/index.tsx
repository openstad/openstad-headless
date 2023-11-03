import './index.css';

export function Banner(
  props: React.HTMLAttributes<HTMLDivElement> & { big?: boolean }
) {
  return (
    <div
      {...props}
      className={`banner ${props.big ? 'big' : ''} ${props.className}`}>
      {props.children}
    </div>
  );
}
