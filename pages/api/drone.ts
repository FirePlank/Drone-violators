import { XMLParser } from 'fast-xml-parser';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const ndzRadius = 100;

  try {
    // Fetch the XML data from the endpoint
    const response = await fetch('https://assignments.reaktor.com/birdnest/drones');
    const xmlData = await response.text();

    // Parse the XML data
    const parser = new XMLParser();
    const root = parser.parse(xmlData);

    const violators = [];

    // Iterate through the drones in the XML data
    for (const drone of root.report.capture.drone) {
      // Extract the serial number and position of the drone
      const serialNumber = drone.serialNumber;
      const positionX = parseFloat(drone.positionX) / 1000;
      const positionY = parseFloat(drone.positionY) / 1000;
      // Calculate the distance of the drone from the nest
      const distance = Math.sqrt(positionX ** 2 + positionY ** 2);

      // Check if the distance is within ndz_radius of 250
      if (Math.abs(250 - distance) <= ndzRadius) {
        // Look up the violator's information in the national drone pilot registry
        const violatorInfo = await getPilotInfo(serialNumber, Math.abs(250 - distance));

        // Add the violator's information to the list of violators
        violators.push(violatorInfo);
      }
    }

    res.send(violators);
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);
    res.status(500).send({ error: message });
  }
};

async function getPilotInfo(serialNumber: String, distance: Number) {
  // Make an HTTP request to the drone pilot API
  const response = await fetch(
    `https://assignments.reaktor.com/birdnest/pilots/${serialNumber}`
  );

  // check if forbidden or not found
  if (response.status === 403) {
    return { name: 'Forbidden', email: 'Forbidden', phone: 'Forbidden' };
  } else if (response.status === 404) {
    return { name: 'Not Found', email: 'Not Found', phone: 'Not Found' };
  }

  // Extract the pilot's information from the API response
  const data = await response.json();
  const name = `${data.firstName} ${data.lastName}`;
  const email = data.email;
  const phone = data.phoneNumber;
  

  // get current time and set to last seen
  const lastSeen = Math.round((new Date()).getTime() / 1000);

  // Return the pilot's information as a dictionary
  return {
    name,
    email,
    phone,
    lastSeen,
    distance,
    serialNumber
  };
}