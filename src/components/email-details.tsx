import {
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  FunnelIcon,
  MailOpenIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from "@/components/icons/lucide";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Heading } from "@/components/ui/heading";
import { Strong, Text } from "@/components/ui/text";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";

export const email = {
  id: 2,
  avatar: "https://avatars.laravel.cloud/71f04d79-220c-4b91-b533-98410fd6298a",
  name: "Olivia Bennett",
  email: "ethan.walker@example.com",
  date: "Mar 30, 2026 at 9:24 AM",
  subject: "Please check the numbers before lunch.",
  message:
    "Hi team,\n\nI've attached the revised proposal for the Q2 campaign for your review. Based on the feedback from yesterday's meeting, I updated the scope, adjusted the timeline, and refined the budget so the overall plan feels more realistic and easier to present to the client.\n\nThe biggest changes are in the rollout approach. I simplified the launch plan, reduced the number of deliverables in phase one, and reorganized the pricing breakdown so each cost is easier to understand. I also clarified a few sections that felt too vague in the previous version, especially around responsibilities, milestones, and expected outcomes.\n\nPlease take a look when you have a moment and let me know if anything still feels off, whether that is the wording, numbers, or structure. I want to make sure everything is aligned before I send the final version to the client later today.\n\nThanks,\nEthan",
};

const messageLines = email.message.split("\n").map((line, index) => ({
  id: `${index}-${line.slice(0, 24)}`,
  line,
}));

export function EmailDetails() {
  return (
    <div className="space-y-6 p-6">
      <Heading level={2}>{email.subject}</Heading>

      <div className="flex items-center gap-x-3">
        <Avatar isSquare size="lg" src={email.avatar} alt={email.name} />
        <div>
          <Strong>{email.name}</Strong>
          <Text>{email.date}</Text>
        </div>
      </div>

      <div className="flex justify-between">
        <ButtonGroup>
          <Tooltip>
            <Button aria-label="Mark as read" intent="secondary">
              <MailOpenIcon />
            </Button>
            <TooltipContent>Mark as read</TooltipContent>
          </Tooltip>
          <Tooltip>
            <Button aria-label="Move to favorite" intent="secondary">
              <StarIcon />
            </Button>
            <TooltipContent>Move to favorite</TooltipContent>
          </Tooltip>
          <Tooltip>
            <Button aria-label="Delete" intent="secondary">
              <TrashIcon />
            </Button>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>

          <Tooltip>
            <Button aria-label="Mark as" intent="secondary">
              <TagIcon />
            </Button>
            <TooltipContent>Mark as</TooltipContent>
          </Tooltip>

          <Tooltip>
            <Button aria-label="Filter" intent="secondary">
              <FunnelIcon />
            </Button>
            <TooltipContent>Filter</TooltipContent>
          </Tooltip>
          <Tooltip>
            <Button aria-label="Archive" intent="secondary">
              <ArchiveBoxIcon />
            </Button>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup>
          <Tooltip>
            <Button aria-label="Reply" intent="secondary">
              <ArrowUturnLeftIcon />
            </Button>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <Button aria-label="Forward" intent="secondary">
              <ArrowUturnRightIcon />
            </Button>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </div>

      <div>
        {messageLines.map((messageLine) => (
          <Text className="text-fg" key={messageLine.id}>
            {messageLine.line || <br />}
          </Text>
        ))}
      </div>
    </div>
  );
}
