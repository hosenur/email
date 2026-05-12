import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/auth/login",
    permanent: false,
  },
});

export default function RegisterPage() {
  return null;
}
