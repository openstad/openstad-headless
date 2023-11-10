import 'remixicon/fonts/remixicon.css';
import { ProgressBar } from '@openstad-headless/ui/src';
import useSWR, { Fetcher } from 'swr';
import { useEffect, useState } from 'react';
import './likes.css';
import loadWidget from '../../lib/load-widget.js';

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
  const apIurl = props.apiUrl || props.config.api?.url;
  const necessaryVotes = props?.config?.votesNeeded || 50;

  const [yesVotes, setYesVotes] = useState<number>(100);
  const [noVotes, setNoVotes] = useState<number>(0);

  const fetcher: Fetcher<{ yes: number; no: number }> = async (url: string) => {
    if (projectId && ideaId) {
      const endpoint = `${
        url || ''
      }/api/project/${projectId}/idea/${ideaId}?includeVoteCount=1&includeUserVote=1`;

      const result = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return result.json();
    }
    return undefined;
  };

  const { data } = useSWR<{ yes: number; no: number }>(apIurl, fetcher);

  useEffect(() => {
    if (data) {
      const yes = data.yes;
      const no = data.no;
      setYesVotes(yes);
      setNoVotes(no);
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

Likes.loadWidget = loadWidget;

export { Likes as default, Likes };
