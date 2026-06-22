/**
 * Cities by state (USPS code → cities). Curated major cities; Georgia is the
 * most complete since it is the primary client base. Extend any list as needed.
 */
export const CITIES_BY_STATE: Record<string, string[]> = {
  AL: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn'],
  AK: ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka', 'Ketchikan'],
  AZ: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Yuma'],
  AR: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'Conway'],
  CA: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside'],
  CO: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder', 'Pueblo'],
  CT: ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury'],
  DE: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
  DC: ['Washington'],
  FL: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Cape Coral', 'Port St. Lucie', 'Kissimmee'],
  GA: [
    'Atlanta', 'Sandy Springs', 'Roswell', 'Marietta', 'Smyrna', 'Alpharetta',
    'Johns Creek', 'Dunwoody', 'Brookhaven', 'Decatur', 'Doraville', 'Chamblee',
    'Norcross', 'Duluth', 'Lawrenceville', 'Suwanee', 'Stone Mountain', 'Lithonia',
    'Stockbridge', 'Jonesboro', 'Forest Park', 'College Park', 'East Point',
    'Augusta', 'Columbus', 'Savannah', 'Athens', 'Macon', 'Gainesville',
    'Kennesaw', 'Tucker', 'Conyers', 'Snellville', 'McDonough'
  ],
  HI: ['Honolulu', 'Hilo', 'Kailua', 'Kaneohe', 'Waipahu', 'Pearl City'],
  ID: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell'],
  IL: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria'],
  IN: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington'],
  IA: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Ames'],
  KS: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence'],
  KY: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
  LA: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner'],
  ME: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
  MD: ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Rockville', 'Frederick', 'Gaithersburg'],
  MA: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy'],
  MI: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint'],
  MN: ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park'],
  MS: ['Jackson', 'Gulfport', 'Southaven', 'Biloxi', 'Hattiesburg', 'Meridian'],
  MO: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee’s Summit'],
  MT: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena', 'Kalispell'],
  NE: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
  NV: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'],
  NH: ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester'],
  NJ: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Trenton', 'Clifton'],
  NM: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
  NY: ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon'],
  NC: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington'],
  ND: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma'],
  OK: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton'],
  OR: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem'],
  RI: ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'],
  SC: ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville'],
  SD: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
  TN: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin'],
  TX: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Plano', 'Laredo', 'Irving', 'Garland'],
  UT: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden'],
  VT: ['Burlington', 'South Burlington', 'Rutland', 'Montpelier', 'Essex'],
  VA: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Arlington', 'Alexandria', 'Newport News'],
  WA: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton'],
  WV: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
  WI: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha'],
  WY: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs']
};

export function citiesForState(code: string | null | undefined): string[] {
  if (!code) {
    return [];
  }
  return CITIES_BY_STATE[code.toUpperCase()] ?? [];
}
