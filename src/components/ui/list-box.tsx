"use client";

import type {
  ListBoxItemProps,
  ListBoxProps,
  ListBoxSectionProps,
} from "react-aria-components";
import {
  composeRenderProps,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
} from "react-aria-components";
import { twJoin, twMerge } from "tailwind-merge";
import { CheckIcon, GripVerticalIcon } from "@/components/icons/lucide";
import { cx } from "@/lib/primitive";
import {
  DropdownDescription,
  DropdownLabel,
  DropdownSection,
  type DropdownSectionProps,
  dropdownItemStyles,
} from "./dropdown";

const ListBox = <T extends object>({
  className,
  ...props
}: ListBoxProps<T>) => (
  <ListBoxPrimitive
    {...props}
    className={cx(
      "grid max-h-96 w-full min-w-56 scroll-py-1 grid-cols-[auto_1fr] flex-col gap-y-1 overflow-y-auto overscroll-contain rounded-xl border bg-bg p-1 outline-hidden [scrollbar-width:thin] has-data-[slot=drag-icon]:grid-cols-[auto_auto_1fr] [&::-webkit-scrollbar]:size-0.5 *:[[role='group']+[role=group]]:mt-4 *:[[role='group']+[role=separator]]:mt-1",
      className,
    )}
  />
);

const ListBoxItem = <T extends object>({
  children,
  className,
  ...props
}: ListBoxItemProps<T>) => {
  const textValue = typeof children === "string" ? children : undefined;
  return (
    <ListBoxItemPrimitive
      textValue={textValue}
      className={composeRenderProps(className, (className, renderProps) =>
        dropdownItemStyles({
          ...renderProps,
          className: twJoin(
            "group not-has-[[slot=description]]:items-start",
            // "has-data-[slot=drag-icon]:*:data-[slot=check-icon]:absolute has-data-[slot=drag-icon]:*:data-[slot=check-icon]:right-0",
            "has-data-[slot=drag-icon]:*:[[slot=label]]:col-start-3",
            "has-data-[slot=drag-icon]:*:data-[slot=icon]:col-start-2",
            "href" in props ? "cursor-pointer" : "cursor-default",
            className,
          ),
        }),
      )}
      data-slot="list-box-item"
      {...props}
    >
      {(renderProps) => {
        const { allowsDragging, isSelected } = renderProps;

        return (
          <>
            {allowsDragging && (
              <GripVerticalIcon
                data-slot="drag-icon"
                className="mr-2 size-5 h-[1lh] text-muted-fg sm:w-4"
              />
            )}
            {isSelected && (
              <CheckIcon
                className="-mx-0.5 mr-2 h-[1lh] w-5 shrink-0 group-allows-dragging:col-start-2 sm:w-4"
                data-slot="check-icon"
              />
            )}
            {typeof children === "function" ? (
              children(renderProps)
            ) : typeof children === "string" ? (
              <DropdownLabel>{children}</DropdownLabel>
            ) : (
              children
            )}
          </>
        );
      }}
    </ListBoxItemPrimitive>
  );
};

const ListBoxSection = <T extends object>({
  className,
  ...props
}: DropdownSectionProps<T>) => {
  return (
    <DropdownSection
      className={twMerge(
        "*:data-[slot=list-box-item]:last:-mb-1.5 gap-y-1",
        className,
      )}
      {...props}
    />
  );
};

const ListBoxLabel = DropdownLabel;
const ListBoxDescription = DropdownDescription;

export type { ListBoxItemProps, ListBoxSectionProps };
export {
  ListBox,
  ListBoxSection,
  ListBoxItem,
  ListBoxLabel,
  ListBoxDescription,
};
