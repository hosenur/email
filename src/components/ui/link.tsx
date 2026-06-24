"use client";

import { createLink } from "@tanstack/react-router";
import {
  Link as LinkPrimitive,
  type LinkProps as LinkPrimitiveProps,
} from "react-aria-components";
import { cx } from "@/lib/primitive";

interface LinkProps extends LinkPrimitiveProps {
  ref?: React.RefObject<HTMLAnchorElement>;
}

const InternalLink = ({ className, ref, ...props }: LinkProps) => {
  return (
    <LinkPrimitive
      ref={ref}
      className={cx(
        [
          "font-medium text-(--text)",
          "outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring forced-colors:outline-[Highlight]",
          "disabled:cursor-default disabled:text-muted-fg forced-colors:disabled:text-[GrayText]",
          "href" in props && "cursor-pointer",
        ],
        className,
      )}
      {...props}
    />
  );
};

const RouterLink = createLink(InternalLink);

type RouterLinkProps = React.ComponentProps<typeof RouterLink>;
type RouterLinkOptions = Partial<
  Omit<RouterLinkProps, keyof LinkProps | "children" | "className">
>;
type AppLinkProps = LinkProps & RouterLinkOptions;

function Link(props: AppLinkProps) {
  if ("to" in props && props.to !== undefined) {
    return <RouterLink {...(props as RouterLinkProps)} />;
  }

  return <InternalLink {...props} />;
}

export type { AppLinkProps as LinkProps };
export { Link };
