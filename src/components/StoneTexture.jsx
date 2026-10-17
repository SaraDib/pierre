import React, { useMemo } from 'react';

let filterSeq = 0;

function hex(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function generateStoneSvg(material, seedOffset = 0, filterId) {
  const m = {
    ...material,
    seed: (material.seed || 1) + seedOffset
  };

  const v = hex(m.vein);
  const t = hex(m.tone);

  const col = (c, a) => `0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${a}`;

  // nuage tonal (commun)
  const cloud = `
    <feTurbulence type="fractalNoise" baseFrequency="0.004 0.006" numOctaves="3" seed="${m.seed + 20}" result="c0"/>
    <feColorMatrix in="c0" type="matrix" values="${col(t, '0.9 0 0 0 -0.25')}" result="cloud"/>
  `;

  let layers = '';

  if (m.type === 'veins') {
    layers = `
      <feTurbulence type="fractalNoise" baseFrequency="${m.freq}" numOctaves="5" seed="${m.seed}" result="n"/>
      <feComponentTransfer in="n" result="r"><feFuncR type="table" tableValues="0 0 0 0 .15 1 .15 0 0 0 0 0"/></feComponentTransfer>
      <feColorMatrix in="r" type="matrix" values="${col(v, '1.35 0 0 0 0')}" result="veins"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="3" seed="${m.seed + 3}" result="n2"/>
      <feComponentTransfer in="n2" result="r2"><feFuncR type="table" tableValues="0 0 0 0 0 .12 1 .12 0 0 0 0 0 0"/></feComponentTransfer>
      <feColorMatrix in="r2" type="matrix" values="${col(v, '.55 0 0 0 0')}" result="thin"/>
      <feMerge><feMergeNode in="cloud"/><feMergeNode in="veins"/><feMergeNode in="thin"/></feMerge>
    `;
  } else if (m.type === 'granit') {
    layers = `
      <feTurbulence type="fractalNoise" baseFrequency="${m.freq}" numOctaves="2" seed="${m.seed}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="${col(v, '16 0 0 0 -8.4')}" result="fl"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="${m.seed + 5}" result="n3"/>
      <feColorMatrix in="n3" type="matrix" values="${col([0.7, 0.55, 0.4], '14 0 0 0 -7.6')}" result="fl2"/>
      <feMerge><feMergeNode in="cloud"/><feMergeNode in="fl"/><feMergeNode in="fl2"/></feMerge>
    `;
  } else if (m.type === 'bands') {
    layers = `
      <feTurbulence type="fractalNoise" baseFrequency="${m.freq}" numOctaves="4" seed="${m.seed}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="${col(v, '2.4 0 0 0 -1.05')}" result="b"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="${m.seed + 9}" result="n4"/>
      <feColorMatrix in="n4" type="matrix" values="${col(v, '7 0 0 0 -3.9')}" result="pores"/>
      <feMerge><feMergeNode in="cloud"/><feMergeNode in="b"/><feMergeNode in="pores"/></feMerge>
    `;
  } else {
    // grain (pierre de Taza)
    layers = `
      <feTurbulence type="fractalNoise" baseFrequency="${m.freq}" numOctaves="3" seed="${m.seed}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="${col(v, '1.7 0 0 0 -.68')}" result="g"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="${m.seed + 4}" result="n5"/>
      <feColorMatrix in="n5" type="matrix" values="${col(v, '1.6 0 0 0 -.85')}" result="st"/>
      <feMerge><feMergeNode in="cloud"/><feMergeNode in="g"/><feMergeNode in="st"/></feMerge>
    `;
  }

  return `
    <svg class="tex" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;">
      <filter id="${filterId}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        ${cloud}
        ${layers}
      </filter>
      <rect width="100%" height="100%" fill="${m.base}"/>
      <rect width="100%" height="100%" filter="url(#${filterId})"/>
    </svg>
  `;
}

export default function StoneTexture({ material, seedOffset = 0, className = 'tex-host', style = {} }) {
  if (!material) return null;

  const filterId = useMemo(
    () => `f_${material.k}_${++filterSeq}`,
    [material.k, material.seed, seedOffset]
  );

  const svgMarkup = useMemo(
    () => generateStoneSvg(material, seedOffset, filterId),
    [material, seedOffset, filterId]
  );

  return (
    <div
      key={filterId}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
