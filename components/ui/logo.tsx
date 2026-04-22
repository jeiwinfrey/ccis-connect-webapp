import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 512 512"
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M93 253 224 122"
      stroke="#08005F"
      strokeWidth="42"
      strokeLinejoin="miter"
    />
    <path
      d="M171 253 232 192"
      stroke="#08005F"
      strokeWidth="42"
      strokeLinejoin="miter"
    />
    <path
      d="M421 253 360 192"
      stroke="#08005F"
      strokeWidth="42"
      strokeLinejoin="miter"
    />
    <path
      d="M93 253 256 416 419 253"
      stroke="#08005F"
      strokeWidth="42"
      strokeLinejoin="miter"
    />
    <path
      d="M171 253 256 338 341 253"
      stroke="#08005F"
      strokeWidth="42"
      strokeLinejoin="miter"
    />
    <path
      d="M171 253 256 338 341 253 256 168 171 253Z"
      stroke="#08005F"
      strokeWidth="42"
      strokeLinejoin="miter"
    />
    <path
      d="M285 127v139"
      stroke="#F9A800"
      strokeWidth="42"
      strokeLinejoin="miter"
    />
    <path
      d="M256 327 306 377 256 427 206 377 256 327Z"
      stroke="#F9A800"
      strokeWidth="22"
      strokeLinejoin="miter"
    />
    <circle cx="268" cy="94" r="44" fill="#08005F" />
    <circle cx="268" cy="94" r="16" fill="white" />
    <circle cx="226" cy="181" r="44" fill="#08005F" />
    <circle cx="226" cy="181" r="16" fill="white" />
    <circle cx="398" cy="191" r="44" fill="#08005F" />
    <circle cx="398" cy="191" r="16" fill="white" />
    <circle cx="285" cy="137" r="44" fill="#F9A800" />
    <circle cx="285" cy="137" r="16" fill="white" />
    <path
      d="M256 348 285 377 256 406 227 377 256 348Z"
      fill="white"
    />
  </svg>
);

export { Logo };
