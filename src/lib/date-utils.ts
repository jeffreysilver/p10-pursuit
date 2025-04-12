
import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  try {
    // Assuming timeString is in format 'HH:MM:SS'
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
}

export function isRacePast(dateString: string): boolean {
  try {
    const raceDate = parseISO(dateString);
    const today = new Date();
    return raceDate < today;
  } catch (error) {
    console.error('Error checking if race is past:', error);
    return false;
  }
}

export function isRaceLive(dateString: string): boolean {
  try {
    const raceDate = parseISO(dateString);
    const today = new Date();
    
    // Consider race live on the same day
    return (
      raceDate.getDate() === today.getDate() &&
      raceDate.getMonth() === today.getMonth() &&
      raceDate.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if race is live:', error);
    return false;
  }
}
