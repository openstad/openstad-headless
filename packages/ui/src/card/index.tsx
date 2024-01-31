import React from 'react';
import '../index.css';
import './index.css';

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Card(props: Props) {
  return (
    <div{...props}className={`${props.className} osc-card`}>
        
    </div>
  );
}
