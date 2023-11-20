import useSWR from "swr";

export default function useCodes(clientId: string) {
  const params = new URLSearchParams();
  params.set('clientId', `${clientId}`);

  const codesListSwr = useSWR(
    `/api/oauth/api/admin/unique-codes?` + params.toString(),
  );
  return { ...codesListSwr };
}
