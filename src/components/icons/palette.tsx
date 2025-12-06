import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string;
}

function PaletteIcon({ size = "18px", ...props }: IconProps) {
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
        d="M9 1.5C7.5 1.5 6.25 2.75 6.25 4.25C6.25 5.75 7.5 7 9 7C10.5 7 11.75 5.75 11.75 4.25C11.75 2.75 10.5 1.5 9 1.5Z"
        fill="currentColor"
      />
      <path
        d="M16.5 9C16.5 8.17 15.83 7.5 15 7.5C14.17 7.5 13.5 8.17 13.5 9C13.5 9.83 14.17 10.5 15 10.5C15.83 10.5 16.5 9.83 16.5 9Z"
        fill="currentColor"
      />
      <path
        d="M4.5 9C4.5 8.17 3.83 7.5 3 7.5C2.17 7.5 1.5 8.17 1.5 9C1.5 9.83 2.17 10.5 3 10.5C3.83 10.5 4.5 9.83 4.5 9Z"
        fill="currentColor"
      />
      <path
        d="M9 16.5C7.5 16.5 6.25 15.25 6.25 13.75C6.25 12.25 7.5 11 9 11C10.5 11 11.75 12.25 11.75 13.75C11.75 15.25 10.5 16.5 9 16.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default PaletteIcon;
