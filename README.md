# EVE Marketwatch Frontend

Based on Discord requests, I'm making the source code for the
frontend public to allow contributions.

Be warned that I built this with only little React experience, as
I wanted to learn that library, as well as antd. I wouldn't
use antd in the future, as E2E testing is incredibly painful due
to all the extra shadow components it generates.

The React app also uses class components, which will be deprecated
in favor of functional components.

## Deployment

The app runs as an SPA on AWS. I'll continue to do the deployment,
assuming the e2e tests look good. I haven't made them public yet,
but plan to do so.

## Code of Conduct

Don't be a dick.

## Available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

