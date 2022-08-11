import Head from "next/head";

export default function Home() {
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
