/**
 * Haversine formula to calculate approximate distance in km between two lat/lng points
 */
export function calculateApproxDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // e.g. 3.5 km
}

/**
 * Serialize teacher or student profile based on privacy and role rules
 * @param {Object} profile - Populated Mongoose profile document or plain object
 * @param {Object|null} requestingUser - The authenticated req.user (null for guests)
 * @param {string|null} connectionStatus - 'accepted' | 'pending' | 'declined' | null
 * @param {Object|null} viewerCoordinates - { lat, lng } of requesting user for distance calculation
 * @returns {Object} Cleaned, serialized profile
 */
export function serializeProfile(profile, requestingUser = null, connectionStatus = null, viewerCoordinates = null) {
  if (!profile) return null;

  const raw = profile.toObject ? profile.toObject({ virtuals: true }) : { ...profile };
  const user = raw.userId || {};
  const isOwner = requestingUser && (
    requestingUser._id?.toString() === user._id?.toString() ||
    requestingUser.id?.toString() === user._id?.toString()
  );
  const isAdmin = requestingUser && requestingUser.role === 'admin';
  const isConnected = connectionStatus === 'accepted';

  // 1. GUEST PREVIEW (Not logged in)
  if (!requestingUser) {
    const rawName = user.name || 'Educator';
    const nameParts = rawName.trim().split(' ');
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
      : `${rawName.charAt(0)}...`;

    return {
      _id: raw._id,
      userId: {
        _id: user._id,
        name: maskedName,
        avatar: user.avatar || raw.profilePhotoUrl || '',
        role: user.role,
        phone: null,
        email: null
      },
      name: maskedName,
      jobId: raw.jobId || '',
      profilePhotoUrl: raw.profilePhotoUrl || user.avatar || '',
      bio: raw.bio || '',
      subjects: raw.subjects || raw.subjectsNeeded || [],
      exams: raw.exams || (raw.classOrExam ? [raw.classOrExam] : []),
      qualifications: raw.qualifications || [],
      certifications: raw.certifications || [],
      degreeDetails: raw.degreeDetails ? { highestDegree: raw.degreeDetails.highestDegree || '', university: raw.degreeDetails.university || '' } : null,
      experience: raw.experience || 0,
      demoVideoUrl: raw.demoVideoUrl || '',
      verifiedResults: raw.verifiedResults || [],
      ranks: raw.ranks || [],
      availability: raw.availability || 'Flexible',
      fee: raw.fee ? { amount: raw.fee.amount, period: raw.fee.period } : null,
      teachingMode: raw.teachingMode || (raw.preferences?.mode) || 'home',
      rating: raw.rating || 4.8,
      isVerified: Boolean(raw.isVerified),
      verificationStatus: raw.verificationStatus || (raw.isVerified ? 'verified' : 'unverified'),
      isAvailable: Boolean(raw.isAvailable),

      // Requirement Details
      board: raw.board || 'ICSE',
      preferredTime: raw.preferredTime || raw.preferredTiming || 'After 4',
      daysPerWeek: raw.daysPerWeek || '6 days a week',
      tutorGender: raw.tutorGender || 'Any',
      studentGender: raw.studentGender || 'Female',

      // Student fields
      classOrExam: raw.classOrExam || '',
      classLevel: raw.classLevel || '',
      subjectsNeeded: raw.subjectsNeeded || [],
      goals: raw.goals || '',
      preferredTiming: raw.preferredTiming || '',
      budget: raw.budget || null,
      preferences: raw.preferences || {},

      // Address & location privacy (area and city only)
      area: raw.area || '',
      location: {
        city: raw.location?.city || 'India',
        state: raw.location?.state || '',
        pincode: null
      },
      fullAddress: null,
      approxDistanceKm: null,

      // Status
      approvalStatus: raw.approvalStatus || 'pending',
      privacy: {
        showPhone: false,
        showFullAddress: false,
        pauseProfile: Boolean(raw.privacy?.pauseProfile)
      },
      connectionStatus: 'none',
      canViewFull: false,
      hasFullPhoneAccess: false,
      hasFullAddressAccess: false,
      isGuestPreview: true
    };
  }

  // 2. OWNER OR ADMIN (Full access)
  if (isOwner || isAdmin) {
    return {
      ...raw,
      name: user.name || raw.name,
      userId: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || raw.profilePhotoUrl || '',
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        isMinor: user.isMinor,
        parentGuardianConsent: user.parentGuardianConsent,
        consentGiven: user.consentGiven
      },
      connectionStatus: isConnected ? 'accepted' : (connectionStatus || 'none'),
      canViewFull: true,
      hasFullPhoneAccess: true,
      hasFullAddressAccess: true,
      approxDistanceKm: null,
      isGuestPreview: false
    };
  }

  // 3. LOGGED-IN OTHER USER
  // Check minor protection (under 18 without parent/guardian consent cannot reveal phone/address to teachers)
  const isTargetMinor = Boolean(user.isMinor || (user.dateOfBirth && (
    (Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000) < 18
  )));
  const hasParentConsent = Boolean(user.parentGuardianConsent);
  const minorBlock = isTargetMinor && !hasParentConsent && requestingUser.role === 'teacher';

  const userPublicAddress = Boolean(raw.privacy?.showFullAddress);

  // Phone numbers are never exposed to other users in the frontend app.
  // The platform acts as a medium between both parties to contact them physically.
  // Only the profile owner or admin has access to phone numbers.
  const canSeePhone = false;
  const canSeeFullAddress = !minorBlock && (isConnected || userPublicAddress);

  // Calculate approximate distance if coordinates exist
  let approxDistanceKm = null;
  if (viewerCoordinates && raw.coordinates?.lat && raw.coordinates?.lng) {
    approxDistanceKm = calculateApproxDistanceKm(
      viewerCoordinates.lat,
      viewerCoordinates.lng,
      raw.coordinates.lat,
      raw.coordinates.lng
    );
  }

  return {
    _id: raw._id,
    userId: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar || raw.profilePhotoUrl || '',
      role: user.role,
      phone: canSeePhone ? (user.phone || '') : null,
      isMinor: isTargetMinor
    },
    name: user.name,
    jobId: raw.jobId || '',
    profilePhotoUrl: raw.profilePhotoUrl || user.avatar || '',
    bio: raw.bio || '',
    subjects: raw.subjects || [],
    exams: raw.exams || [],
    qualifications: raw.qualifications || [],
    certifications: raw.certifications || [],
    degreeDetails: raw.degreeDetails ? { highestDegree: raw.degreeDetails.highestDegree || '', university: raw.degreeDetails.university || '' } : null,
    experience: raw.experience || 0,
    demoVideoUrl: raw.demoVideoUrl || '',
    verifiedResults: raw.verifiedResults || [],
    ranks: raw.ranks || [],
    availability: raw.availability || 'Flexible',
    fee: raw.fee || null,
    teachingMode: raw.teachingMode || 'home',
    rating: raw.rating || 4.8,
    isVerified: Boolean(raw.isVerified && raw.verificationStatus === 'verified'),
    verificationStatus: raw.verificationStatus || (raw.isVerified ? 'verified' : 'unverified'),
    verificationSubmittedAt: raw.verificationSubmittedAt || null,
    verifiedAt: raw.verifiedAt || null,
    rejectionReason: raw.rejectionReason || '',
    isAvailable: Boolean(raw.isAvailable),

    // Requirement Details
    board: raw.board || 'ICSE',
    preferredTime: raw.preferredTime || raw.preferredTiming || 'After 4',
    daysPerWeek: raw.daysPerWeek || '6 days a week',
    tutorGender: raw.tutorGender || 'Any',
    studentGender: raw.studentGender || 'Female',

    // Student fields if student profile
    classOrExam: raw.classOrExam || '',
    classLevel: raw.classLevel || '',
    subjectsNeeded: raw.subjectsNeeded || [],
    goals: raw.goals || '',
    preferredTiming: raw.preferredTiming || '',
    budget: raw.budget || null,
    preferences: raw.preferences || {},
    studentOrParentRole: raw.studentOrParentRole || 'student',
    verificationPhone: raw.verificationPhone || user.phone || '',
    verificationEmail: raw.verificationEmail || user.email || '',
    contactVerified: Boolean(raw.isVerified && raw.verificationStatus === 'verified'),

    // Location privacy
    area: raw.area || '',
    location: {
      city: raw.location?.city || '',
      state: raw.location?.state || '',
      pincode: canSeeFullAddress ? (raw.location?.pincode || '') : null
    },
    fullAddress: canSeeFullAddress ? (raw.fullAddress || '') : null,
    approxDistanceKm,

    // Status and permissions
    approvalStatus: raw.approvalStatus || 'pending',
    privacy: {
      showPhone: Boolean(raw.privacy?.showPhone),
      showFullAddress: Boolean(raw.privacy?.showFullAddress),
      pauseProfile: Boolean(raw.privacy?.pauseProfile)
    },
    connectionStatus: connectionStatus || 'none',
    canViewFull: true,
    hasFullPhoneAccess: canSeePhone,
    hasFullAddressAccess: canSeeFullAddress,
    isGuestPreview: false
  };
}
