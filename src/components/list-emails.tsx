import { Autocomplete, useFilter } from "react-aria-components/Autocomplete";
import {
  GridList,
  GridListDescription,
  GridListItem,
} from "@/components/ui/grid-list";
import { SearchField, SearchInput } from "@/components/ui/search-field";
import { Strong } from "@/components/ui/text";

const emails = [
  {
    id: 1,
    avatar: "https://avatars.laravel.cloud/ethan.walker@example.com",
    name: "Ethan Walker",
    date: "Mar 30",
    subject: "Sent the revised proposal this morning.",
  },
  {
    id: 2,
    avatar:
      "https://avatars.laravel.cloud/71f04d79-220c-4b91-b533-98410fd6298a",
    name: "Olivia Bennett",
    date: "Mar 30",
    subject: "Please check the numbers before lunch.",
  },
  {
    id: 3,
    avatar:
      "https://avatars.laravel.cloud/2e05d1d2-b4f5-4587-b652-d2c7f69b4eb7?vibe=sunset",
    name: "Noah Carter",
    date: "Mar 29",
    subject: "The client approved the first draft.",
  },
  {
    id: 4,
    avatar:
      "https://avatars.laravel.cloud/9a1a5d24-7b04-47e4-bb7b-92f5a3542d8c?vibe=ocean",
    name: "Ava Brooks",
    date: "Mar 29",
    subject: "Uploading the final assets now.",
  },
  {
    id: 5,
    avatar:
      "https://avatars.laravel.cloud/9a40dbdd-0d57-4482-83fb-9e118c6acab1?vibe=daybreak",
    name: "Liam Foster",
    date: "Mar 28",
    subject: "Can we move the meeting to 3 PM?",
  },
  {
    id: 6,
    avatar:
      "https://avatars.laravel.cloud/363c0f6f-2e6f-4036-9a8d-d0f4ebd8b7fd?vibe=bubble",
    name: "Mia Sullivan",
    date: "Mar 28",
    subject: "I left feedback on the homepage.",
  },
  {
    id: 7,
    avatar:
      "https://avatars.laravel.cloud/3f30cba5-8411-4bc6-9e04-472075c07cbd?vibe=forest",
    name: "Lucas Reed",
    date: "Mar 28",
    subject: "The new copy looks much better now.",
  },
  {
    id: 8,
    avatar:
      "https://avatars.laravel.cloud/b887c2e4-52d8-4399-bded-f1741b9f70f7?vibe=fire",
    name: "Charlotte Hayes",
    date: "Mar 27",
    subject: "Sharing the latest campaign report.",
  },
  {
    id: 9,
    avatar:
      "https://avatars.laravel.cloud/79f5da7c-b26a-4358-afd7-71b552c267c3?vibe=crystal",
    name: "James Cooper",
    date: "Mar 27",
    subject: "Need your sign-off before publishing.",
  },
  {
    id: 10,
    avatar: "https://avatars.laravel.cloud/emily.parker@example.com",
    name: "Emily Parker",
    date: "Mar 27",
    subject: "I booked the call for tomorrow.",
  },
  {
    id: 11,
    avatar: "https://avatars.laravel.cloud/benjamin.hughes@example.com",
    name: "Benjamin Hughes",
    date: "Mar 26",
    subject: "There is a small issue in checkout.",
  },
  {
    id: 12,
    avatar: "https://avatars.laravel.cloud/amelia.ward@example.com",
    name: "Amelia Ward",
    date: "Mar 26",
    subject: "Thanks for the quick turnaround.",
  },
  {
    id: 13,
    avatar: "https://avatars.laravel.cloud/henry.ross@example.com",
    name: "Henry Ross",
    date: "Mar 26",
    subject: "The invoice has been paid today.",
  },
  {
    id: 14,
    avatar: "https://avatars.laravel.cloud/harper.price@example.com",
    name: "Harper Price",
    date: "Mar 25",
    subject: "Please send over the updated file.",
  },
  {
    id: 15,
    avatar: "https://avatars.laravel.cloud/jack.morris@example.com",
    name: "Jack Morris",
    date: "Mar 25",
    subject: "Looks good from my side.",
  },
  {
    id: 16,
    avatar: "https://avatars.laravel.cloud/evelyn.bryant@example.com",
    name: "Evelyn Bryant",
    date: "Mar 25",
    subject: "We should simplify the pricing section.",
  },
  {
    id: 17,
    avatar: "https://avatars.laravel.cloud/daniel.wood@example.com",
    name: "Daniel Wood",
    date: "Mar 24",
    subject: "I added the missing screenshots.",
  },
  {
    id: 18,
    avatar: "https://avatars.laravel.cloud/ella.powell@example.com",
    name: "Ella Powell",
    date: "Mar 24",
    subject: "Can you send the export again?",
  },
  {
    id: 19,
    avatar: "https://avatars.laravel.cloud/matthew.long@example.com",
    name: "Matthew Long",
    date: "Mar 24",
    subject: "The draft is ready for review.",
  },
  {
    id: 20,
    avatar: "https://avatars.laravel.cloud/grace.butler@example.com",
    name: "Grace Butler",
    date: "Mar 23",
    subject: "Let's finalize this by Friday.",
  },
];

export function ListEmails() {
  const { contains } = useFilter({
    sensitivity: "base",
  });
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Autocomplete filter={contains}>
        <div className="sticky top-0 z-10 border-b bg-muted/50 py-1 focus-within:bg-muted/70">
          <SearchField aria-label="Search">
            <SearchInput
              className="border-none focus:ring-0"
              placeholder="Search messages"
            />
          </SearchField>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <GridList
            aria-label="Emails"
            className="rounded-none border-none bg-transparent dark:bg-transparent"
            items={emails}
            selectionMode="single"
            defaultSelectedKeys={[2]}
          >
            {(item) => (
              <GridListItem
                textValue={item.name}
                href="#"
                className="inset-ring-transparent"
                key={item.id}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Strong>{item.name}</Strong>
                    <GridListDescription>{item.date}</GridListDescription>
                  </div>
                  <GridListDescription className="max-w-xs truncate">
                    {item.subject}
                  </GridListDescription>
                </div>
              </GridListItem>
            )}
          </GridList>
        </div>
      </Autocomplete>
    </div>
  );
}
