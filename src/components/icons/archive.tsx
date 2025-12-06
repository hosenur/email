import React, { SVGProps } from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  strokeWidth?: number;
  size?: string;
}

function IconBoxArchiveOutlineDuo18({
  strokeWidth = 1.5,
  size = "18px",
  ...props
}: IconProps) {
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
        d="M14.75 6.25V13.25C14.75 14.355 13.855 15.25 12.75 15.25H5.25C4.145 15.25 3.25 14.355 3.25 13.25V6.25"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
        data-stroke="none"
      ></path>{" "}
      <path
        d="M14.75 6.25V13.25C14.75 14.355 13.855 15.25 12.75 15.25H5.25C4.145 15.25 3.25 14.355 3.25 13.25V6.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>{" "}
      <path
        d="M15.25 2.75H2.75C2.19772 2.75 1.75 3.19772 1.75 3.75V5.25C1.75 5.80228 2.19772 6.25 2.75 6.25H15.25C15.8023 6.25 16.25 5.80228 16.25 5.25V3.75C16.25 3.19772 15.8023 2.75 15.25 2.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>{" "}
      <path
        d="M7 9.25H11"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

export default IconBoxArchiveOutlineDuo18;
