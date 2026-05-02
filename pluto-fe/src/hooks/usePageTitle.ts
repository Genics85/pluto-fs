import { useEffect } from "react";

export const usePageTitle = (pageTitle: string) => {
  useEffect(() => {
    document.title = `LoanTrack | ${pageTitle}`;

    return () => {
      document.title = "LoanTrack";
    };
  }, [pageTitle]);
};
