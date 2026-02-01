// Icône escalier simple : uniquement des marches
import * as React from "react";

// Icône escalier stylisé (juste des marches)
export function IconStairs({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  // 5 traits horizontaux identiques, largeur maximale, décalés de 50% sur x, espacés verticalement (espacement augmenté)
  // Largeur du trait : 48, décalage x : 0, 24, 48, 72, 96 (50% de 48)
  // y : 52, 38, 24, 10, -4 (espacement vertical +14px)
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      viewBox="0 0 144 64"
      {...props}
    >
      {/* 5 marches très larges, décalées, trait épais, espacées verticalement */}
      <line x1="0" y1="52" x2="48" y2="52" stroke="currentColor" strokeLinecap="butt" />
      <line x1="24" y1="38" x2="72" y2="38" stroke="currentColor" strokeLinecap="butt" />
      <line x1="48" y1="24" x2="96" y2="24" stroke="currentColor" strokeLinecap="butt" />
      <line x1="72" y1="10" x2="120" y2="10" stroke="currentColor" strokeLinecap="butt" />
      <line x1="96" y1="-4" x2="144" y2="-4" stroke="currentColor" strokeLinecap="butt" />
    </svg>
  );
}

// Icône montre moderne pour la durée (GAPP, formations...)
export function IconWatch({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 48 48"
      {...props}
    >
      {/* Cadran */}
      <circle
        cx={24}
        cy={24}
        r={20}
        fill="currentColor"
        className="text-primary/10"
      />
      <circle
        cx={24}
        cy={24}
        r={18}
        stroke="currentColor"
        strokeWidth={2.5}
        fill="none"
      />
      {/* Repères horaires principaux */}
      <g stroke="currentColor" strokeWidth={2}>
        <line x1={24} y1={6} x2={24} y2={10} />
        <line x1={24} y1={38} x2={24} y2={42} />
        <line x1={6} y1={24} x2={10} y2={24} />
        <line x1={38} y1={24} x2={42} y2={24} />
      </g>
      {/* Repères horaires secondaires (petits traits) */}
      <g stroke="currentColor" strokeWidth={1}>
        <line x1={34.14} y1={13.86} x2={36.28} y2={11.72} />
        <line x1={13.86} y1={13.86} x2={11.72} y2={11.72} />
        <line x1={13.86} y1={34.14} x2={11.72} y2={36.28} />
        <line x1={34.14} y1={34.14} x2={36.28} y2={36.28} />
      </g>
      {/* Centre */}
      <circle cx={24} cy={24} r={2.5} fill="currentColor" />
      {/* Aiguilles */}
      <line
        x1={24}
        y1={24}
        x2={24}
        y2={12}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1={24}
        y1={24}
        x2={34}
        y2={24}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Couronne (remontoir) */}
      <rect
        x={22}
        y={2}
        width={4}
        height={4}
        rx={1.5}
        fill="currentColor"
      />
    </svg>
  );
}
export function IconStethoscope(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={props.className} {...props}>
      <path d="M6 3v7a6 6 0 0 0 12 0V3" />
      <circle cx="6" cy="3" r="2" />
      <circle cx="18" cy="3" r="2" />
      <path d="M12 17v2a3 3 0 0 0 6 0v-2" />
    </svg>
  );
}

export function IconHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={props.className} {...props}>
      <path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
    </svg>
  );
}

export function IconManager(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={props.className} {...props}>
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M12 13v2" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function IconBuilding(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={props.className} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

export function IconHand(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={props.className} {...props}>
      <path d="M2 17v-2a2 2 0 0 1 2-2h7v-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-7v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
    </svg>
  );
}
