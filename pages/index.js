import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const loading = status === "loading";

  // Using the latest Prisma, this generates an error.
  // Leaving this code in place for now....
  // if (loading) {
  //   return null;
  // }

  // if (session) {
  //   router.push("/dashboard");
  //   return;
  // }

  // This seems to fix the problem.  See README.md.
  useEffect(() => {
    if (!(session || loading)) {
      return;
    }

    if (session) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);

  return (
    <div>
      <Head>
        <title>Project Manager</title>
        <meta name="description" content="Project Manager" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center ">
        <h1 className="mt-10 font-extrabold text-2xl">Project Manager</h1>

        <p className="mt-10">The best way to manage your projects!</p>

        <p className="mt-10">Free 7 days trial then just $19.99/m</p>

        <div className="mt-10">
          <a className="bg-black text-white px-5 py-2" href="/api/auth/signin">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
