import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react';

interface Violator {
  serialNumber: string,
  name: string,
  email: string,
  phone: string,
  lastSeen: number,
  distance: number
}

const Home: NextPage = () => {
  const [violators, setViolators] = useState<Violator[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/drone');
      const data = await res.json();
      // add new violators
      setViolators((violators) => {
        // check if violator is already in the list and if so update the last seen time and distance from nest if its lower
        const newViolators = data.filter((violator: { serialNumber: string, lastSeen: number, distance: number }) => {
          const existingViolator = violators.find((v: { serialNumber: string }) => v.serialNumber === violator.serialNumber);
          if (existingViolator) {
            existingViolator.lastSeen = violator.lastSeen;
            // if the distance is lower than the existing one, update it
            if (violator.distance < existingViolator.distance) {
              existingViolator.distance = violator.distance;
            }
            return false;
          }
          return true;
        });
        return [...violators, ...newViolators];
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

      <main className="flex w-full flex-1 flex-col mt-4 pl-[2rem] text-center">
        <div className="container">
          <h1 className="text-4xl font-bold text-center flex justify-center mb-4">Drone Violators</h1>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-x-[18rem] gap-y-4">
            {violators.map((violator) => (
              <div key={violator.serialNumber} className="p-2 rounded-lg shadow-md bg-white" style={{ width: '300px', height: '150px' }}>
                <h2 className="text-xl font-bold mb-2">{violator.name}</h2>
                <p className="text-gray-700 mb-2 text-sm">Email: {violator.email}</p>
                <p className="text-gray-700 mb-2 text-sm">Phone: {violator.phone}</p>
                <p className="text-gray-700 mb-2 text-sm">
                  Closest distance from nest: {Math.round(violator.distance)} meters
                </p>
              </div>            
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
