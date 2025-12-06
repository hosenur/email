import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string;
}

function BellIcon({ size = "18px", ...props }: IconProps) {
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
        d="M14.847 11.789C14.146 11.082 14 10.396 14 9.75C14 8.231 12.866 7 11.375 7H6.625C5.134 7 4 8.231 4 9.75C4 10.396 3.854 11.082 3.153 11.789C2.884 12.054 2.75 12.413 2.75 12.75C2.75 13.44 3.26 14 3.925 14H14.075C14.74 14 15.25 13.44 15.25 12.75C15.25 12.413 15.116 12.054 14.847 11.789Z"
        fill="currentColor"
      />
      <path
        d="M9 16C9.552 16 10 15.552 10 15C10 14.448 9.552 14 9 14C8.448 14 8 14.448 8 15C8 15.552 8.448 16 9 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default BellIcon;
