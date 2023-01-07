# Drone Violation Tracker

This web application is an assignment project for a job application that is meant to help authorities track and contact drone pilots who have recently violated the no-drone zone (NDZ) within 100 meters of a bird nest. The app displays the pilot's name, email, phone number, and the closest confirmed distance to the nest. The pilot information is persisted for 10 minutes since their drone was last seen by the monitoring equipment. The app automatically updates the information in real-time without requiring manual refresh.

## Installation and usage

1. Clone the repository:
`git clone https://github.com/FirePlank/Drone-violators.git`

2. Install the dependencies:

&emsp;&emsp;`cd Drone-violators`

&emsp;&emsp;`npm install`

3. Run the development server:
`npm run dev`


The app will be running at http://localhost:3000.

## API Endpoints

- `/api/drone`: Fetches the violators informations from external APIs.

## Limitations
The persistent storage for the violator information does not work on the hosted version of the website most of the time. This is because the website is hosted on Vercel, which does not offer persistent storage. In this case, a file was used for storage instead of a database in order to save time and to keep the hosting costs free. Ideally, a database should be used for persistent storage in a production environment.
