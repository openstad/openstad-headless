import { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const withApiUrl = (async () => {
    return { props: { apiUrl: process.env.API_URL } };
  }) satisfies GetServerSideProps<{ apiUrl: string }>;


export type InferredServerSideProps = InferGetServerSidePropsType<typeof withApiUrl>