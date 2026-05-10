"use client";

import type {
  GridListItemProps,
  GridListProps,
  TextProps,
} from "react-aria-components";
import {
  Button,
  composeRenderProps,
  GridListHeader as GridListHeaderPrimitive,
  GridListItem as GridListItemPrimitive,
  GridList as GridListPrimitive,
  GridListSection as GridListSectionPrimitive,
  Text,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { GripVerticalIcon } from "@/components/icons/lucide";
import { cx } from "@/lib/primitive";
import { Checkbox } from "./checkbox";

const GridList = <T extends object>({
  className,
  ...props
}: GridListProps<T>) => (
  <GridListPrimitive
    data-slot="grid-list"
    className={cx(
      "relative flex flex-col gap-y-1 has-data-[slot=grid-list-section]:gap-y-6 *:data-drop-target:border *:data-drop-target:border-accent sm:text-sm/6",
      className,
    )}
    {...props}
  />
);

const GridListSection = <T extends object>({
  className,
  ...props
}: React.ComponentProps<typeof GridListSectionPrimitive<T>>) => {
  return (
    <GridListSectionPrimitive
      data-slot="grid-list-section"
      className={twMerge("space-y-1", className)}
      {...props}
    />
  );
};

const GridListHeader = ({
  className,
  ...props
}: React.ComponentProps<typeof GridListHeaderPrimitive>) => {
  return (
    <GridListHeaderPrimitive
      data-slot="grid-list-header"
      className={twMerge("mb-2 font-semibold text-sm/6", className)}
      {...props}
    />
  );
};

const GridListItem = ({ className, children, ...props }: GridListItemProps) => {
  const textValue = typeof children === "string" ? children : undefined;
  return (
    <GridListItemPrimitive
      textValue={textValue}
      {...props}
      className={composeRenderProps(
        className,
        (className, { isHovered, isFocusVisible, isSelected }) =>
          twMerge(
            "[--grid-list-item-bg-active:var(--color-primary-subtle)] [--grid-list-item-text-active:var(--color-primary-subtle-fg)]",
            "group inset-ring inset-ring-border rounded-lg px-3 py-2.5",
            "relative min-w-0 outline-hidden [--mr-icon:--spacing(2)]",
            "flex min-w-0 cursor-default items-center gap-2 sm:gap-2.5",
            "dragging:cursor-grab dragging:opacity-70 dragging:**:[[slot=drag]]:text-(--grid-list-item-text-active)",
            "**:data-[slot=icon]:size-5 **:data-[slot=icon]:shrink-0 **:data-[slot=icon]:text-muted-fg sm:**:data-[slot=icon]:size-4",
            (isSelected || isHovered || isFocusVisible) &&
              "inset-ring-ring/70 bg-(--grid-list-item-bg-active) text-(--grid-list-item-text-active) **:[.text-muted-fg]:text-(--grid-list-item-text-active)/60",
            "href" in props && "cursor-pointer",
            className,
          ),
      )}
    >
      {(values) => (
        <>
          {values.allowsDragging && (
            <Button slot="drag">
              <GripVerticalIcon
                data-slot="drag-icon"
                className="size-4 text-muted-fg"
              />
            </Button>
          )}

          {values.selectionMode === "multiple" &&
            values.selectionBehavior === "toggle" && (
              <Checkbox
                className="[--indicator-mt:0] *:gap-x-0 sm:[--indicator-mt:0]"
                slot="selection"
              />
            )}
          {typeof children === "function" ? children(values) : children}
        </>
      )}
    </GridListItemPrimitive>
  );
};

const GridListEmptyState = ({
  ref,
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div ref={ref} className={twMerge("p-6", className)} {...props} />
);

const GridListSpacer = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      ref={ref}
      aria-hidden
      className={twMerge("-ml-4 flex-1", className)}
      {...props}
    />
  );
};

const GridListStart = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      ref={ref}
      className={twMerge(
        "relative flex items-center gap-x-2.5 sm:gap-x-3",
        className,
      )}
      {...props}
    />
  );
};

interface GridListTextProps extends TextProps {
  ref?: React.Ref<HTMLDivElement>;
}

const GridListLabel = ({ className, ref, ...props }: GridListTextProps) => (
  <Text ref={ref} className={twMerge("font-medium", className)} {...props} />
);

const GridListDescription = ({
  className,
  ref,
  ...props
}: GridListTextProps) => (
  <Text
    slot="description"
    ref={ref}
    className={twMerge("font-normal text-muted-fg text-sm", className)}
    {...props}
  />
);

export type { GridListProps, GridListItemProps };
export {
  GridList,
  GridListSection,
  GridListHeader,
  GridListStart,
  GridListSpacer,
  GridListItem,
  GridListEmptyState,
  GridListLabel,
  GridListDescription,
};
