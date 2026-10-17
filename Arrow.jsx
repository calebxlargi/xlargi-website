import React from 'react';

export default function Arrow({ down = false, direction = down ? 'down' : 'up-right' }) {
  const source = `/icons/arrows.svg#${direction}`;
  return <svg className="arrow-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={source} xlinkHref={source} /></svg>;
}
