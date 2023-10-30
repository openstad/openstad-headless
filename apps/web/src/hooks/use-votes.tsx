import useSWR from "swr";


export default function useVotes () { 

  const votesSwr = useSWR('/api/openstad/api/votes');


  return {...votesSwr};
}