import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="79 75 650 660"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <image href="/ccis-connect-logo.svg" width="810" height="810" preserveAspectRatio="xMidYMid meet" />
  </svg>
);

export { Logo };
