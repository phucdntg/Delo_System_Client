import { useEffect } from "react";
import { useMatches } from "react-router-dom";
import { APP_NAME } from "@shared/constants/systemConstants";

export default function RouteTitleSync() {
  const matches = useMatches();

  useEffect(() => {
    const matchedRoute = [...matches]
      .reverse()
      .find((match) => match?.handle?.title);
    const routeTitle = matchedRoute?.handle?.title;

    document.title = routeTitle ? `${routeTitle}` : APP_NAME;
  }, [matches]);

  return null;
}
