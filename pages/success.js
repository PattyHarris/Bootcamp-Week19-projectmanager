import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const { data: session, status } = useSession();

  const loading = status === "loading";

  useEffect(() => {
    const call = async () => {
      await fetch("/api/stripe/success", {
        method: "POST",
        body: JSON.stringify({
          session_id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      window.location = "/dashboard";
    };

    call();
  }, [session_id]);

  if (loading) {
    return null;
  }

  if (!session) {
    router.push("/");
    return;
  }

  return <div></div>;
}

export async function getServerSideProps(context) {
  // The router query data is not available client-side - router data is needed
  // to pull our the Stripe session ID.
  // see https://nextjs.org/docs/api-reference/next/router#router-object
  return {
    props: {},
  };
}
