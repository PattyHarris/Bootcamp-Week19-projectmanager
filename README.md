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
