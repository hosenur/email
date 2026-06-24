import { useLocation, useNavigate } from "@tanstack/react-router";

export function useSelectedEmailId(): [
  string | null,
  (emailId: string | null) => void,
] {
  const location = useLocation();
  const navigate = useNavigate();
  const search = location.search as { id?: unknown };
  const selectedId = typeof search.id === "string" ? search.id : null;

  function setSelectedId(emailId: string | null) {
    const target = location.pathname.includes("/sent") ? "/sent" : "/inbox";

    navigate({
      to: target,
      search: (previous) => {
        return {
          ...previous,
          id: emailId || undefined,
        };
      },
    });
  }

  return [selectedId, setSelectedId];
}
