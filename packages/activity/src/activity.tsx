import { loadWidget } from '@openstad-headless/lib/load-widget';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Paragraph, Heading } from '@utrecht/component-library-react';
import React from 'react';
import './activity.css';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import DataStore from '@openstad-headless/data-store/src';
import {useState} from 'react';

export type ActivityWidgetProps = BaseProps &
ActivityProps &
  ProjectSettingProps & {
    resourceId?: string;
  };
export type ActivityProps = {
  currentTitle?: string;
  otherTitle?: string;
  noActivityTextCurrent?: string;
  noActivityTextOther?: string;
  currentSite?: Array<any>;
  otherSites?: Array<any>;
  truncate?: number;
  api?: object;
  projectId: string;
};

type ActivityData = {
  date: string;
  description: string;
  title: string;
  label: string;
  site: string;
}

type ActivityDataStructure = {
  currentSite: ActivityData[];
  otherSites: ActivityData[];
}

function Activity({
  currentSite,
  otherSites,
  currentTitle,
  otherTitle,
  truncate = 80,
  noActivityTextCurrent,
  noActivityTextOther,
  ...props
}: ActivityProps) {
  const [activityData, setActivityData] = useState<ActivityDataStructure>();

  const datastore: any = new DataStore({
      projectId: props.projectId,
      api: props.api,
  });

  // get userId from session storage, perhaps we should change this in the future.
  const sessionData = sessionStorage.getItem('openstad');
  const userId = sessionData ? JSON.parse(sessionData)[props.projectId]?.openStadUser?.id : null;
  
  const {
      data: userActivityData,
      error: activityError,
      isLoading: activityDataLoading,
  } = datastore.useUserActivity({ ...props, projectId: props.projectId, userId: userId});

  const getActivityData = () => {
    if(activityDataLoading === false && activityData === undefined ){
      // Get all activities, and sort them by project id (other than this project id and current project id), data.activitiy is the array
      const others = userActivityData.activity.filter((data: any) => data?.resource?.projectId != props.projectId);
      const current = userActivityData.activity.filter((data: any) => data?.resource?.projectId == props.projectId);

      let formattedCurrent: ActivityData[] = [];
      let formattedOthers: ActivityData[] = [];

      // format each activity like the activityData type
      current.forEach((activity: any) => {
        formattedCurrent.push({
          date: activity?.createdAt ?? '',
          description: activity?.description  ?? '-',
          title: activity?.title  ?? '-',
          label: activity?.label  ?? '-',
          site: activity?.project?.url ?? ''
        });
      });

      others.forEach((activity: any) => {
        formattedOthers.push({
          date: activity?.createdAt ?? '',
          description: activity?.description ?? '-',
          title: activity?.type?.label ?? '-',
          label: activity?.type?.label ?? '-',
          site: activity?.project?.url ?? ''
        });
      });

      setActivityData({
        currentSite: formattedCurrent,
        otherSites: formattedOthers
      });
    }
  }

  // Init
  React.useEffect(() => {
    getActivityData();
  }, [activityDataLoading]);
  
  const listItem = (data: ActivityData, key: number) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(data.date);

    const truncatedDescription = data.description.length > truncate ? `${data.description.substring(0, truncate)}...` : data.description;
    return (
      <li key={key} className='activity__item'>
        <Heading level={3} className='activity__header'>{data.title} <span className='activity__header--label'>{data.label}</span></Heading>
        <Paragraph className='activity__description'>{truncatedDescription}</Paragraph>
        <div>
          <Paragraph className='activity__siteTitle'>{data.site}</Paragraph>
          <Paragraph className='activity__date'>{date.toLocaleDateString("nl-NL", options)}</Paragraph>
        </div>
      </li>
    )
  }

  const noActivity = (text: string) => {
    return (
      <li className='no-activity'>
        <Paragraph>{text}</Paragraph>
      </li>
    )
  }

  return (
    <section className="user-activity">

      <div>
        <Heading level={2}>{currentTitle ? currentTitle : 'Activiteit op deze website'}</Heading>

        <ul className="user-acivity__list">

          {activityData === undefined || activityData.currentSite === undefined || activityData.currentSite.length === 0 && (
            noActivity( noActivityTextCurrent ? noActivityTextCurrent : 'U heeft geen activiteit op deze website.')
          )}

          {activityData !== undefined && activityData.currentSite && (
            activityData.currentSite.map((item, key) => (
              listItem(item, key)
            ))
          )}
        </ul>
      </div>

      <div>
        <Heading level={2}>{otherTitle ? otherTitle : 'Activiteit op andere websites'}</Heading>
        <ul className="user-acivity__list">

          {activityData === undefined || activityData.otherSites === undefined || activityData.otherSites.length === 0 && (
            noActivity( noActivityTextOther ? noActivityTextOther : 'U heeft geen activiteit op andere websites.')
          )}
          {activityData !== undefined && activityData.otherSites && (
            activityData.otherSites.map((item, key) => (
              listItem(item, key)
            ))
          )}
        </ul>
      </div>

    </section>
  );
}

Activity.loadWidget = loadWidget;
export { Activity };
