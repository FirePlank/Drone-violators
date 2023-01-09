# Drone Violation Tracker

This web application is an assignment project for a job application that is meant to help authorities track and contact drone pilots who have recently violated the no-drone zone (NDZ) within 100 meters of a bird nest. The app displays the pilot's name, email, phone number, and the closest confirmed distance to the nest. The pilot information is persisted for 10 minutes since their drone was last seen by the monitoring equipment. The app automatically updates the information in real-time without requiring manual refresh.

## Installation and usage

1. Clone the repository:
`git clone https://github.com/FirePlank/Drone-violators.git`

2. Install the dependencies:

&emsp;&emsp;`cd Drone-violators`

&emsp;&emsp;`npm install`

3. Rename the `.env.local.example` file to `.env.local` and add the MongoDB URL to the `MONGODB_URI` variable.

4. Run the development server:
`npm run dev`


The app will be running at http://localhost:3000.

## API Endpoints

- `/api/drone`: Fetches the violators informations from external APIs.

## Limitations
The app may not be updated with the latest violator information if the website has not been visited in awhile. This is because the website is hosted for free and does not have server tasks running every other second to update the violators manually without visitors. In a production environment, server tasks can be used to keep the information up to date.
