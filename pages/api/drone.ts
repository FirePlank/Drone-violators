import { XMLParser } from 'fast-xml-parser';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

const saveViolators = (violators: any) => {
  // update the file isntead of overwriting but remove old duplicates
  // create file if it doesn't exist
  if (!fs.existsSync('/tmp/violators.json')) {
    fs.writeFileSync('/tmp/violators.json', JSON.stringify([]));
  }
  // read file
  const data = fs.readFileSync('/tmp/violators.json', 'utf8');
  const json = JSON.parse(data);
  // if duplicate exists, replace it with new data
  for (let i = 0; i < json.length; i++) {
    for (let j = 0; j < violators.length; j++) {
      if (json[i].serialNumber === violators[j].serialNumber) {
        json[i] = violators[j];
        break;
      }
    }
  }
  // add new data to the file
  json.push(...violators);
  // write to file
  fs.writeFileSync('/tmp/violators.json', JSON.stringify(json));
};

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
      // distance formula
      const distance = Math.sqrt(Math.pow((250 - positionX), 2) + Math.pow((250 - positionY), 2));
      // Check if the distance is within ndz_radius of 250
      if (distance <= ndzRadius) {
        // Look up the violator's information in the national drone pilot registry
        const violatorInfo = await getPilotInfo(serialNumber, distance, positionX, positionY);
        // check that info was found
        if (violatorInfo.name === 'Forbidden' || violatorInfo.name === 'Not Found') {
          continue;
        }
        // Add the violator's information to the list of violators
        violators.push(violatorInfo);
      }
    }
    // update json file with new data
    saveViolators(violators);
    res.send(violators);
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);
    res.status(500).send({ error: message });
  }
};

async function getPilotInfo(serialNumber: string, distance: number, positionX: number, positionY: number) {
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
  const name: string = `${data.firstName} ${data.lastName}`;
  const email: string = data.email;
  const phone: string = data.phoneNumber;
  

  // get current time and set to last seen
  const lastSeen: number = Math.round((new Date()).getTime() / 1000);

  // Return the pilot's information as a dictionary
  return {
    name,
    email,
    phone,
    lastSeen,
    distance,
    serialNumber,
    positionX,
    positionY,
  };
}