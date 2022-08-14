# Project Manager

This project simulates something like Basecamp or Asana. User can create lists for projects and within those lists, add tasks (e.g. TODOs). The tasks can be checked as completed.

Users will pay to access and use the app that allows for a monthly plan using Stripe. There is a 7-day free trial as well. Users can cancel their subscription at anytime.

The final project can be found here:
https://github.com/flaviocopes/bootcamp-2022-week-19-projectmanager

Note: Missing from Week18, is the final project:
https://github.com/flaviocopes/bootcamp-2022-week-18-localreviews

## Initial Setup

As with the other projects:

    - set up an empty Next.js app
      - npx create-next-app@latest localreviews
    - allow absolute imports for modules
      - jsconfig.json
    - add Tailwind CSS
      - npm install -D tailwindcss postcss autoprefixer
      - npx tailwindcss init -p)
      - add configuration to 'tailwind.config.js' and 'styles/globals.css'.
    - create a PostgreSQL database and configure the '.env' file.
    - install Prisma
      - npm install -D prisma
      - npx prisma init)
    - setup authentication:
      - Generate a new secret (https://generate-secret.vercel.app/32)
      - npm install next-auth pg @next-auth/prisma-adapter nodemailer
      - Add the following to the .env file:
            EMAIL_SERVER=smtp://user:pass@smtp.mailtrap.io:465
            EMAIL_FROM=Your name <you@email.com>
            NEXTAUTH_URL=http://localhost:3000
            SECRET=<ENTER A UNIQUE STRING HERE>
      - Create the [...nextauth].js file in '/pages/api/auth'.
      - Add the usual models to the 'prisma/schema.prisma' file (e.g. VerificationRequest, Account, Session, and User).  This weeks models include the isSubscriber and stripeSubscriptionId values added the User model to implement Stripe subscriptions.
        - Be sure to run: npx prisma migrate dev
      - Refactor 'pages/_app.js' to use the 'SessionProvider'.

Note: Use the following to generate the new secret:
https://generate-secret.vercel.app/32

And lastly, refactor 'index.js' to contain minimal content:

```
        import Head from 'next/head'

        export default function Home() {
        return (
            <div>
            <Head>
                <title>Blog</title>
                <meta name='description' content='Blog' />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <h1>Welcome!</h1>
            </div>
        )
        }
```

## Create the Home Page

Not much here - simple web page that describe the app showing that subscriptions with a 7-day free trial and then $19.99 a month. The 'pages/index.js' includes a login button, but no real functionality yet.

## Login and Check the Subscription State

1. In this section, refactor the 'pages/index.js' to redirect the user to the dashboard if they are logged in.
2. The dashboard currently has hardcoded data showing 2 lists, each with some tasks.
3. From 'pages/dashboard.js', if the user isn't subscribed, the user is redirected to the the subscription page (next lesson).
4. At this point, I ran in the following error:

```
next-dev.js?3515:20 Error: Abort fetching component for route: "/dashboard"
    at handleCancelled (router.js?8684:346:27)
    at _callee$ (router.js?8684:1249:17)
    at tryCatch (runtime.js?ecd4:45:16)
    at Generator.invoke [as _invoke] (runtime.js?ecd4:274:1)
    at prototype.<computed> [as next] (runtime.js?ecd4:97:1)
    at asyncGeneratorStep (_async_to_generator.js?0e30:23:1)
    at _next (_async_to_generator.js?0e30:12:1)
window.console.error @ next-dev.js?3515:20

```

It runs out that the latest version of Prisma seems to be the culprit. I tested by downgrading to version 4.1.1 - error goes away.

The following seems to fix the problem - EDIT: Nope, if you close the tab and then relaunch the app (and there is a session ID), you get the same error....

```
  useEffect(() => {
    if (!(session || loading)) {
      return;
    }

    if (session) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);

```

So the real issue here is that the 'push' is called multiple times. Why we didn't see this error before is a mystery. Using this SO article:
https://stackoverflow.com/questions/73343986/next-js-abort-fetching-component-for-route-login

The above explains it better - but basically, we need to prevent the push from happening multiple times. And since the useEffect has multiple dependencies, it's tricky. So, the addition of 'useState' - the article doesn't do this correctly, but the following seems to work:

```
  const [redirected, setRedirected] = useState(false);

  // This seems to fix the problem.  See README.md.
  useEffect(() => {
    const loading = status === "loading";
    if (!(session || loading)) {
      return;
    }

    if (session) {

      if (redirected) {
        return;
      }

      setRedirected(true);
      router.push("/dashboard");
    }
  }, [session, status, router, redirected]);

```

## Add a Stripe Subscription

1. Similar to Week 17, we need to create a 'product' - set the name to 'Project manager subscription'. Set the price to $19.99 and recurring.
2. Add the product ID to the .env file:

```
STRIPE_PRICE_ID=price_************YOUR VALUE****
```

3. Install the Stripe libraries:

```
npm i @stripe/react-stripe-js @stripe/stripe-js stripe
```

4. We also need these other keys for the .env file - on the Stripe dashboard click the 'Developers' button to find the public and secret key:

```
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
BASE_URL=http://localhost:3000
```

5. Add 'pages/subscribe.js' that provides a button for the user to click to subscribe to our product. When the user clicks the button, we'll send the request to 'pages/api/stripe/session.js'. This endpoint handler sends both a success and 'cancel' URL destination to Stripe as well as a 'client_reference_id' to we know what user is associated with the transaction.
6. The difference between this week and week 17, that this week we set a free trial adding this option to 'stripe.checkout.sessions.create()':

```
subscription_data: {
  trial_period_days: 7
},
```

7. Once the transaction is initialized, the Stripe session ID is returned back to the client - the session ID is then used to send the user to payment.
8. In 'pages/subscribe.js' we need to import the Stripe library (using the 'Script' tag).
9. In 'pages/subscribe.js', in the button click event handler we use the Stripe frontend library with the Stripe session ID to redirect the user to checkout - here's the complete button handler code - it's the same as Week 17:

```
        <button
          className="mt-10 bg-black text-white px-5 py-2"
          onClick={async () => {
            const res = await fetch("/api/stripe/session", {
              method: "POST",
            });

            const data = await res.json();

            if (data.status === "error") {
                alert(data.message);
                return;
              }

              const sessionId = data.sessionId;
              const stripePublicKey = data.stripePublicKey;

              const stripe = Stripe(stripePublicKey);
              stripe.redirectToCheckout({
                sessionId,
              });
            }}
        >
          Create a subscription
        </button>

```

10. At this point, when you're sent to Stripe, you will see a '7 Days Free' message.
11. Assuming success, setup the 'pages/success.js' - note that we need to use 'getServerSideProps' to retrieve the the router query which holds the Stripe session ID. Using 'getServerSideProps' with no real purpose servers only to make the page server side generated - which then allows access to the router.query.
12. In 'pages/success.js', we send a request to 'pages/api/stripe/success.js' to obtain the Stripe checkout session information (e.g. the client ID). With that client ID, we can update the database to set the user's 'isSubscriber' flag to true.

Summary:

1. Setup a Stripe session.
2. Use Stripe session ID to send the user to checkout.
3. Stripe returns control back to the client using either the 'success' or 'cancel' URL setup in the session data.
4. In the 'success' page, we make a request to 'api/stripe/success', using the Stripe session ID, to pull out the client ID we passed in step 1 above (by calling stripe.checkout.sessions.retrieve) so we can set the user as 'subscribed'.
