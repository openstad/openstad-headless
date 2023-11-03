import 'remixicon/fonts/remixicon.css';
import ProgressBar from '../../progressbar';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import './index.css';

type Props = {
  projectId?: string;
  ideaId?: string;
  apiUrl?: string;
  config: {
    projectId?: string;
    ideaId?: string;
    api?: {
      url: string;
    };
    votesNeeded?: number;
  };
};

function Likes(props: Props) {
  const projectId = props.projectId || props.config?.projectId;
  const ideaId = props.ideaId || props.config?.ideaId;
  const url = props.apiUrl || props.config.api?.url;
  const necessaryVotes = props?.config?.votesNeeded || 50;

  const [yesVotes, setYesVotes] = useState<number>(100);
  const [noVotes, setNoVotes] = useState<number>(0);

  const { data, error, isLoading } = useSWR(
    { projectId, ideaId },
    async ({ projectId, ideaId }) => {
      let endpoint = `${url}/api/project/${projectId}/idea/${ideaId}?includeVoteCount=1&includeUserVote=1`;

      let headers = {
        'Content-Type': 'application/json',
      };
      const result = await fetch(endpoint, { headers });
      return await result.json();
    }
  );

  useEffect(() => {
    if (data) {
      setYesVotes(data?.yes || 0);
      setNoVotes(data?.no || 0);
    }
  }, [data]);

  return (
    <>
      <div id="like-widget-container">
        <h3 className="like-widget-title">Likes</h3>
        <div className="like-option">
          <section className="like-kind">
            <i className="ri-thumb-up-line"></i>
            <div>Voor</div>
          </section>

          <section className="like-counter">
            <p>
              {yesVotes < 10 ? yesVotes.toString().padStart(2, '0') : yesVotes}
            </p>
          </section>
        </div>
        <div className="like-option">
          <section className="like-kind">
            <i className="ri-thumb-down-line"></i>
            <div>Tegen</div>
          </section>

          <section className="like-counter">
            <p>
              {noVotes < 10 ? noVotes.toString().padStart(2, '0') : noVotes}
            </p>
          </section>
        </div>

        <div className="progressbar-container">
          <ProgressBar progress={(yesVotes / necessaryVotes) * 100} />
          <p className="progressbar-counter">
            {yesVotes} /{necessaryVotes}
          </p>
        </div>
      </div>
    </>
  );
}

export default Likes;
