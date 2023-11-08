import useSWR from "swr";

export default function useCodes() {

  const codesListSwr = useSWR(`http://localhost:31430/api/admin/unique-codes`);
  return { ...codesListSwr };
}