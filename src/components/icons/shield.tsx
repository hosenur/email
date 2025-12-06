import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string;
}

function ShieldIcon({ size = "18px", ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        d="M9 1.5L16 3V6.75C16 10.125 13.5 12.75 9 14.25C4.5 12.75 2 10.125 2 6.75V3L9 1.5Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        d="M9 2L15 3.5V7C15 10.25 12.75 12.75 9 14C5.25 12.75 3 10.25 3 7V3.5L9 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ShieldIcon;
