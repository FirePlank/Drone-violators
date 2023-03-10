import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import clientPromise from '../lib/mongodb';

// Violator interface
interface Violator {
  serialNumber: string,
  name: string,
  email?: string,
  phone?: string,
  lastSeen: number,
  distance: number,
  positionX: number,
  positionY: number,
}

const Home: NextPage<{ loadedViolators: Violator[] }> = ({ loadedViolators }) => {
  // State for the list of violators
  const [violators, setViolators] = useState<Violator[]>(loadedViolators)
  // State for the hovered violator
  const [hoveredViolator, setHoveredViolator] = useState<Violator>();
  // nest position coordinates
  const nestPosition = {x: 250, y: 250};

  // Function to scale coordinates
  /**
 * width: integer, width of image in px
 * height: integer, height of image in px;
 * x: integer, horizontal distance from left
 * y: integer, vertical distance from top
 * scale: float, scale factor (1,5 = 150%)
 */
  const scaleCoordinates = (width: number, height: number, x: number, y: number, scale: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const relX = x - centerX;
    const relY = y - centerY;
    const scaledX = relX * scale;
    const scaledY = relY * scale;
    return { x: scaledX + centerX, y: scaledY + centerY };
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/drone');
      const data = await res.json();
      // add new violators
      setViolators((violators) => {
        // check if violator is already in the list and if so update the last seen time
        try {
          const newViolators = data.filter((violator: { serialNumber: string, lastSeen: number, distance: number, positionX: number, positionY: number }) => {
            const existingViolator = violators.find((v: { serialNumber: string }) => v.serialNumber === violator.serialNumber);
            if (existingViolator) {
              existingViolator.lastSeen = violator.lastSeen;
              // if the distance is lower than the existing one, update it and the position
              if (violator.distance < existingViolator.distance) {
                existingViolator.distance = violator.distance;
                existingViolator.positionX = violator.positionX;
                existingViolator.positionY = violator.positionY;
              }
              return false;
            }
            return true;
          });
          return [...violators, ...newViolators];
        } catch (e) {
          return violators;
        }
      });
      // remove violators that have not been seen in the last 10 minutes
      setViolators((violators) => violators.filter((violator) => (new Date()).getTime() / 1000 - violator.lastSeen < 600));
    };

    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Drone Violators</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col mt-4 px-20 text-center">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Drone Violators</h1>
          <p className="text-gray-700 mb-4">This website displays a real-time map of the area around a bird nest, where a no drone zone (NDZ) has been established within a 100 meter radius of the nest.
          Any drones that are detected within this NDZ are considered to be violating the rules, and the registered pilots of these drones are listed on this website.
          The map shows the position of the bird nest as a blue dot, and the position of any violating drones as red dots.
          When you hover your mouse over a red dot, a popup box will appear displaying the name, email, and phone number of the violating pilot. The NDZ is also outlined on the map as a yellow circle.
          This website updates every 2 seconds to show the most recent information about violating drones. The information about each pilot is persisted for 10 minutes since their drone was last detected.
          </p>
          <div className="relative mt-[4rem]" style={{
            height: '520px',
            width: '520px',
            backgroundColor: "#8bc34a",
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <div style={{
                  top: `${nestPosition.y}px`,
                  left: `${nestPosition.x}px`,
                }}
                className='absolute h-6 w-6 rounded-full outline outline-[202px] outline-yellow-400'
            />
            <div
                className="absolute rounded-full h-6 w-6 bg-blue-500 outline outline-[194px] outline-[#8bc34a]"
                style={{
                  top: `${nestPosition.y}px`,
                  left: `${nestPosition.x}px`,
                }}
                onMouseEnter={() => setHoveredViolator({ serialNumber: 'nest', name: 'The Bird Nest', lastSeen: 0, distance: 0, positionX: nestPosition.x+18, positionY: nestPosition.y+50 })}
                onMouseLeave={() => setHoveredViolator(undefined)}
            />

            {/* Render red circles for each violator based on their coordinates */}
            {violators.map((violator) => (
              
              <div
                key={violator.serialNumber}
                className="absolute rounded-full h-[0.9rem] w-[0.9rem] bg-red-500"
                style={{
                  top: `${scaleCoordinates(500, 500, violator.positionX, violator.positionY, 2).y}px`,
                  left: `${scaleCoordinates(500, 500, violator.positionX, violator.positionY, 2).x}px`,
                }}
                onMouseEnter={() => setHoveredViolator(violator)}
                onMouseLeave={() => setHoveredViolator(undefined)}
              />
            ))}

            {/* Popup with the violator details */}
            {hoveredViolator && (
              <div
                className="absolute bg-white p-4 rounded-lg shadow-md min-w-max"
                style={{
                  top: `${scaleCoordinates(500, 500, hoveredViolator.positionX, hoveredViolator.positionY, 2).y - 200}px`,
                  left: `${scaleCoordinates(500, 500, hoveredViolator.positionX, hoveredViolator.positionY, 2).x - 120}px`,
                }}
              >
                <h2 className="text-2xl font-bold mb-2">{hoveredViolator.name}</h2>
                {hoveredViolator.email && (
                  <p className="text-gray-700 mb-2">
                    Email: {hoveredViolator.email}
                  </p>
                )}
                {hoveredViolator.phone && (
                  <p className="text-gray-700 mb-2">
                    Phone: {hoveredViolator.phone}
                  </p>
                )}
                {hoveredViolator.distance > 0 && (
                  <p className="text-gray-700 mb-2">
                    Distance from nest: {Math.round(hoveredViolator.distance)} meters
                </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Get the intial violators from the file system
export const getServerSideProps = async ({ _res }: any) => {

  // connect to the database
  const client = await clientPromise;
  const db = client.db("violators");
  const collection = db.collection('information');

  // get the violators from the database and exclude the _id field
  const violators = await collection.find({}, { projection: { _id: 0 } }).toArray();

  // remove violators that have not been seen in the last 10 minutes
  const filteredViolators = violators.filter((violator) => (new Date()).getTime() / 1000 - violator.lastSeen < 600);
  // save the filtered violators back to the database if any have been removed
  if (filteredViolators.length !== violators.length) {
    await collection.deleteMany({});
    if (filteredViolators.length > 0) {
      await collection.insertMany(filteredViolators);
    }
  }
  
  return {
    props: {
      loadedViolators: filteredViolators,
    },
  };
};

export default Home;