/**
 * Centralized location data for ToppScorers.
 * Restricted strictly to Prayagraj and Fatehpur districts,
 * with their respective localities and areas.
 */

export const DISTRICTS = [
  // 'Prayagraj', // Commented out for now
  'Fatehpur'
];

export const DISTRICT_AREAS = {
  /*
  Prayagraj: [
    'Civil Lines',
    'Katra',
    'George Town',
    'Ashok Nagar',
    'Mumfordganj',
    'Teliyarganj',
    'Tagore Town',
    'Naini',
    'Jhalwa',
    'Dhoomanganj',
    'Kareli',
    'Rajrooppur',
    'Govindpur',
    'Phaphamau',
    'Jhusi',
    'Allapur',
    'Daraganj',
    'Kydganj',
    'Subedarganj',
    'Bamrauli',
    'Colonelganj',
    'Other Area'
  ],
  */
  Fatehpur: [
    'Civil Lines',
    'Radha Nagar',
    'GT Road',
    'Awas Vikas',
    'Patel Nagar',
    'Shanti Nagar',
    'Harihar Ganj',
    'Chauraha',
    'Bindki',
    'Khaga',
    'Bakewar',
    'Haswa',
    'Kishanpur',
    'Asothar',
    'Jahanabad',
    'Bahuwa',
    'Malwa',
    'Kalyanpur',
    'Thariyaon',
    'Other Area'
  ]
};

export const getAreasForDistrict = (district) => {
  if (!district) return [];
  return DISTRICT_AREAS[district] || [];
};
