export const VALID_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const RBC_RECIPIENT_TO_DONORS = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], 
};

export const RBC_DONOR_TO_RECIPIENTS = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], 
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export const PLASMA_RECIPIENT_TO_DONORS = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], 
  'O+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A-', 'A+', 'AB-', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B-', 'B+', 'AB-', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB-', 'AB+'], 
};

export const getCompatibleDonorGroups = (recipientGroup, component = 'rbc') => {
  const grp = (recipientGroup || '').toUpperCase().trim();
  if (component === 'plasma') {
    return PLASMA_RECIPIENT_TO_DONORS[grp] || [grp];
  }
  return RBC_RECIPIENT_TO_DONORS[grp] || [grp];
};

export const getCompatibleRecipientGroups = (donorGroup) => {
  const grp = (donorGroup || '').toUpperCase().trim();
  return RBC_DONOR_TO_RECIPIENTS[grp] || [grp];
};

export const isBloodCompatible = (donorGroup, recipientGroup, component = 'rbc') => {
  const dGrp = (donorGroup || '').toUpperCase().trim();
  const rGrp = (recipientGroup || '').toUpperCase().trim();
  if (dGrp === rGrp) return true;

  const compatibleDonors = getCompatibleDonorGroups(rGrp, component);
  return compatibleDonors.includes(dGrp);
};

export const calculateMatchScore = (donorGroup, recipientGroup) => {
  const d = (donorGroup || '').toUpperCase().trim();
  const r = (recipientGroup || '').toUpperCase().trim();

  if (d === r) {
    return {
      score: 100,
      tier: 'exact',
      label: 'Exact Match (100%)',
      compatible: true,
      description: `Identical ABO/Rh group match (${d}).`,
    };
  }

  if (isBloodCompatible(d, r, 'rbc')) {
    if (d === 'O-') {
      return {
        score: 90,
        tier: 'universal',
        label: 'Universal Donor Match (90%)',
        compatible: true,
        description: 'O- Negative universal cellular compatibility.',
      };
    }
    return {
      score: 80,
      tier: 'compatible',
      label: 'Medically Compatible (80%)',
      compatible: true,
      description: `${d} red blood cells are clinically compatible with ${r} recipient.`,
    };
  }

  return {
    score: 0,
    tier: 'incompatible',
    label: 'Incompatible (0%)',
    compatible: false,
    description: `${d} blood antibodies are incompatible with ${r} plasma antigens.`,
  };
};
