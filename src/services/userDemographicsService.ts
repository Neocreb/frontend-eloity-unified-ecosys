import { supabase } from "@/integrations/supabase/client";

// Types for demographics data
interface User {
  id: string;
  date_of_birth: string | null;
  gender: string | null;
  location: string | null;
  interests: string[] | null;
}

export interface AgeDemographic {
  range: string;
  percentage: number;
  count: string;
}

export interface GenderDemographic {
  gender: string;
  percentage: number;
  count: string;
}

export interface LocationDemographic {
  location: string;
  percentage: number;
  count: string;
}

export interface InterestDemographic {
  interest: string;
  percentage: number;
}

export interface UserDemographics {
  age: AgeDemographic[];
  gender: GenderDemographic[];
  location: LocationDemographic[];
  interests: InterestDemographic[];
}

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

// Utility function to categorize age into ranges
const getAgeRange = (age: number): string => {
  if (age >= 18 && age <= 24) return "18-24";
  if (age >= 25 && age <= 34) return "25-34";
  if (age >= 35 && age <= 44) return "35-44";
  if (age >= 45 && age <= 54) return "45-54";
  return "55+";
};

// Utility function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Fetch user demographics data
export const fetchUserDemographics = async (): Promise<UserDemographics> => {
  try {
    // Fetch all users with demographic information
    const { data: users, error } = await supabase
      .from('users')
      .select('id, date_of_birth, gender, location, interests')
      .not('date_of_birth', 'is', null);

    if (error) {
      console.error('Error fetching user demographics:', error);
      throw error;
    }

    // Process age demographics
    const ageCounts: Record<string, number> = {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0
    };

    // Process gender demographics
    const genderCounts: Record<string, number> = {
      "Male": 0,
      "Female": 0,
      "Other": 0
    };

    // Process location demographics
    const locationCounts: Record<string, number> = {};

    // Process interests
    const interestCounts: Record<string, number> = {};

    // Total user count for percentage calculations
    let totalUsers = users.length;

    // Process each user
    users.forEach((user: User) => {
      // Age processing
      if (user.date_of_birth) {
        const age = calculateAge(user.date_of_birth);
        const ageRange = getAgeRange(age);
        ageCounts[ageRange] = (ageCounts[ageRange] || 0) + 1;
      }

      // Gender processing
      if (user.gender) {
        const gender = user.gender.toLowerCase();
        if (gender === 'male') {
          genderCounts["Male"]++;
        } else if (gender === 'female') {
          genderCounts["Female"]++;
        } else {
          genderCounts["Other"]++;
        }
      }

      // Location processing
      if (user.location) {
        const location = user.location;
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }

      // Interests processing (assuming interests is stored as a JSON array)
      if (user.interests && Array.isArray(user.interests)) {
        user.interests.forEach((interest: string) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      }
    });

    // Convert age counts to demographics array
    const ageDemographics: AgeDemographic[] = Object.entries(ageCounts)
      .map(([range, count]) => ({
        range,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        count: formatNumber(count)
      }));

    // Convert gender counts to demographics array
    const genderDemographics: GenderDemographic[] = Object.entries(genderCounts)
      .filter(([_, count]) => count > 0) // Only include genders that have users
      .map(([gender, count]) => ({
        gender,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        count: formatNumber(count)
      }));

    // Convert location counts to demographics array (top 6 locations)
    const locationEntries = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 6);

    // Add "Others" category if there are more than 6 locations
    let othersCount = 0;
    if (Object.keys(locationCounts).length > 6) {
      othersCount = Object.values(locationCounts)
        .sort((a, b) => b - a)
        .slice(6)
        .reduce((sum, count) => sum + count, 0);
    }

    const locationDemographics: LocationDemographic[] = locationEntries
      .map(([location, count]) => ({
        location,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        count: formatNumber(count)
      }));

    // Add "Others" if needed
    if (othersCount > 0) {
      locationDemographics.push({
        location: "Others",
        percentage: totalUsers > 0 ? Math.round((othersCount / totalUsers) * 100) : 0,
        count: formatNumber(othersCount)
      });
    }

    // Convert interest counts to demographics array (top 5 interests)
    const interestEntries = Object.entries(interestCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 5);

    const interestDemographics: InterestDemographic[] = interestEntries
      .map(([interest, count]) => ({
        interest,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
      }));

    return {
      age: ageDemographics,
      gender: genderDemographics,
      location: locationDemographics,
      interests: interestDemographics
    };
  } catch (error) {
    console.error('Error processing user demographics:', error);
    throw error; // Propagate the error instead of returning fallback data
  }
};