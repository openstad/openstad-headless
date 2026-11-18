import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const withApiUrl = (async () => {
  return { props: { apiUrl: process.env.API_URL } };
}) satisfies GetServerSideProps<{ apiUrl: string }>;

export type WithApiUrlProps = InferGetServerSidePropsType<typeof withApiUrl>;

export const withCmsUrl = (async () => {
  return { props: { cmsUrl: process.env.CMS_URL ?? '' } };
}) satisfies GetServerSideProps<{ cmsUrl: string }>;

export type WithCmsUrlProps = InferGetServerSidePropsType<typeof withCmsUrl>;

export const withWhitelistedEmails = (async () => {
  const whitelistedEmails = (process.env.WHITELISTED_EMAILS ?? '')
    .split(/[\n,]/)
    .map((e) => e.trim())
    .filter(Boolean);
  return { props: { whitelistedEmails } };
}) satisfies GetServerSideProps<{ whitelistedEmails: string[] }>;

export type WithWhitelistedEmailsProps = InferGetServerSidePropsType<
  typeof withWhitelistedEmails
>;
