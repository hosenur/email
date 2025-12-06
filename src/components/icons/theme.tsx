import type React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string;
}

function ThemeIcon({ size = "18px", ...props }: IconProps) {
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
        d="M5 9C5 6.7909 6.79084 5 9 5V13C6.79084 13 5 11.2091 5 9Z"
        fill="currentColor"
      />
      <path
        d="M1 9C1 4.58179 4.58168 1 9 1V5C6.79084 5 5 6.7909 5 9C5 11.2091 6.79084 13 9 13V17C4.58168 17 1 13.4182 1 9Z"
        fill="currentColor"
        fillOpacity="0.4"
        data-color="color-2"
      />
      <path
        d="M13 9C13 6.7909 11.2092 5 9 5V13C11.2092 13 13 11.2091 13 9Z"
        fill="currentColor"
        fillOpacity="0.4"
        data-color="color-2"
      />
      <path
        d="M17 9C17 4.58179 13.4183 1 9 1V5C11.2092 5 13 6.7909 13 9C13 11.2091 11.2092 13 9 13V17C13.4183 17 17 13.4182 17 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ThemeIcon;
