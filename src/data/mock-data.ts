export interface Driver {
  id: string;
  name: string;
  team: string;
  number: number;
  code: string;
}

export interface Race {
  id: string;
  name: string;
  circuit: string;
  location: string;
  date: string;
  time?: string;
  tenthPlaceDriver?: string; // For completed races
}

export interface Player {
  id: string;
  name: string;
  username: string;
  score: number;
  predictions: Record<string, string[]>; // raceId -> array of driverIds in order of preference
}

// Mock Drivers Data
export const drivers: Driver[] = [
  { id: '1', name: 'Max Verstappen', team: 'Red Bull Racing', number: 1, code: 'VER' },
  { id: '2', name: 'Sergio Perez', team: 'Red Bull Racing', number: 11, code: 'PER' },
  { id: '3', name: 'Charles Leclerc', team: 'Ferrari', number: 16, code: 'LEC' },
  { id: '4', name: 'Carlos Sainz', team: 'Ferrari', number: 55, code: 'SAI' },
  { id: '5', name: 'Lewis Hamilton', team: 'Mercedes', number: 44, code: 'HAM' },
  { id: '6', name: 'George Russell', team: 'Mercedes', number: 63, code: 'RUS' },
  { id: '7', name: 'Lando Norris', team: 'McLaren', number: 4, code: 'NOR' },
  { id: '8', name: 'Oscar Piastri', team: 'McLaren', number: 81, code: 'PIA' },
  { id: '9', name: 'Fernando Alonso', team: 'Aston Martin', number: 14, code: 'ALO' },
  { id: '10', name: 'Lance Stroll', team: 'Aston Martin', number: 18, code: 'STR' },
  { id: '11', name: 'Pierre Gasly', team: 'Alpine', number: 10, code: 'GAS' },
  { id: '12', name: 'Esteban Ocon', team: 'Alpine', number: 31, code: 'OCO' },
  { id: '13', name: 'Daniel Ricciardo', team: 'RB', number: 3, code: 'RIC' },
  { id: '14', name: 'Yuki Tsunoda', team: 'RB', number: 22, code: 'TSU' },
  { id: '15', name: 'Valtteri Bottas', team: 'Sauber', number: 77, code: 'BOT' },
  { id: '16', name: 'Zhou Guanyu', team: 'Sauber', number: 24, code: 'ZHO' },
  { id: '17', name: 'Kevin Magnussen', team: 'Haas F1 Team', number: 20, code: 'MAG' },
  { id: '18', name: 'Nico Hulkenberg', team: 'Haas F1 Team', number: 27, code: 'HUL' },
  { id: '19', name: 'Alexander Albon', team: 'Williams', number: 23, code: 'ALB' },
  { id: '20', name: 'Logan Sargeant', team: 'Williams', number: 2, code: 'SAR' },
];

// Mock Races Data - 2025 Season (fictional dates)
export const races: Race[] = [
  {
    id: '1',
    name: 'Bahrain Grand Prix',
    circuit: 'Bahrain International Circuit',
    location: 'Sakhir, Bahrain',
    date: '2025-03-02',
    time: '15:00:00',
    tenthPlaceDriver: '10', // Lance Stroll
  },
  {
    id: '2',
    name: 'Saudi Arabian Grand Prix',
    circuit: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    date: '2025-03-09',
    time: '18:00:00',
    tenthPlaceDriver: '12', // Esteban Ocon
  },
  {
    id: '3',
    name: 'Australian Grand Prix',
    circuit: 'Albert Park Circuit',
    location: 'Melbourne, Australia',
    date: '2025-03-23',
    time: '06:00:00',
    tenthPlaceDriver: '13', // Daniel Ricciardo
  },
  {
    id: '4',
    name: 'Japanese Grand Prix',
    circuit: 'Suzuka International Racing Course',
    location: 'Suzuka, Japan',
    date: '2025-04-06',
    time: '07:00:00',
    tenthPlaceDriver: '9', // Fernando Alonso
  },
  {
    id: '5',
    name: 'Chinese Grand Prix',
    circuit: 'Shanghai International Circuit',
    location: 'Shanghai, China',
    date: '2025-04-20',
    time: '08:00:00',
  },
  {
    id: '6',
    name: 'Miami Grand Prix',
    circuit: 'Miami International Autodrome',
    location: 'Miami, USA',
    date: '2025-05-04',
    time: '20:30:00',
  },
  {
    id: '7',
    name: 'Emilia Romagna Grand Prix',
    circuit: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola, Italy',
    date: '2025-05-18',
    time: '14:00:00',
  },
  {
    id: '8',
    name: 'Monaco Grand Prix',
    circuit: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    date: '2025-05-25',
    time: '14:00:00',
  },
];

// Mock Players Data
export const players: Player[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    username: 'alexj',
    score: 20,
    predictions: {
      '1': ['10'], // Lance Stroll (correct)
      '2': ['5', '6', '8', '12', '13'], // Lewis Hamilton and others
      '3': ['7', '9', '12'], // Lando Norris and others
      '4': ['9', '11', '17'], // Fernando Alonso and others
    }
  },
  {
    id: '2',
    name: 'Sarah Miller',
    username: 'sarahm',
    score: 10,
    predictions: {
      '1': ['8', '7', '3', '5', '2'],
      '2': ['12', '14', '16'],
      '3': ['9', '10', '5'],
      '4': ['11', '13', '15'],
    }
  },
  {
    id: '3',
    name: 'Mike Wilson',
    username: 'mikew',
    score: 10,
    predictions: {
      '1': ['4', '3', '1'],
      '2': ['6', '7', '8', '10'],
      '3': ['13', '15', '17', '19'],
      '4': ['14', '16', '18', '20'],
    }
  },
  {
    id: '4',
    name: 'Emily Davis',
    username: 'emilyd',
    score: 0,
    predictions: {
      '1': ['3', '1', '5', '7', '9'],
      '2': ['7', '9', '11'],
      '3': ['11', '13', '15'],
      '4': ['4', '6', '8'],
    }
  },
];

// Helper function to get a driver by id
export function getDriverById(id: string): Driver | undefined {
  return drivers.find(driver => driver.id === id);
}

// Helper function to get a race by id
export function getRaceById(id: string): Race | undefined {
  return races.find(race => race.id === id);
}

// Helper function to get a player by id
export function getPlayerById(id: string): Player | undefined {
  return players.find(player => player.id === id);
}

// Helper function to get available drivers for a specific race
export function getAvailableDriversForRace(raceId: string): Driver[] {
  // Get all drivers selected for this race
  const selectedDriverIds = players.reduce((acc: string[], player) => {
    const driverIds = player.predictions[raceId] || [];
    return [...acc, ...driverIds];
  }, []);
  
  // Return drivers that haven't been selected
  return drivers.filter(driver => !selectedDriverIds.includes(driver.id));
}
