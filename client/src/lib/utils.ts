import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getToxicityColor(score: number): string {
  if (score >= 70) return 'text-red-600'; // High toxicity - red
  if (score >= 30) return 'text-amber-500'; // Moderate toxicity - yellow
  return 'text-green-600'; // Low toxicity - green
}

export function getToxicityBgColor(score: number): string {
  if (score >= 70) return 'bg-red-600'; // High toxicity - red
  if (score >= 30) return 'bg-amber-500'; // Moderate toxicity - yellow
  return 'bg-green-600'; // Low toxicity - green
}

// New function that returns CSS gradient style for toxicity bar
export function getToxicityGradientStyle(score: number): React.CSSProperties {
  // Use different background colors based on the toxicity score
  let background;
  
  if (score < 30) {
    // Green only for low toxicity (0-30%)
    background = '#22c55e';
  } else if (score < 70) {
    // Green to yellow gradient for medium toxicity (30-70%)
    background = `linear-gradient(90deg, 
      #22c55e 0%, 
      #eab308 100%)`;
  } else {
    // Full gradient for high toxicity (70-100%)
    background = `linear-gradient(90deg, 
      #22c55e 0%, 
      #eab308 50%, 
      #dc2626 100%)`;
  }
  
  return {
    background,
    width: `${score}%`,
  };
}

export function isMyMessage(username: string, currentUsername: string): boolean {
  return username === currentUsername;
}

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function generateUserColor(username: string): string {
  // Simple hash function to generate a stable color from username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to HSL color (always bright/saturated)
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 80%, 55%)`;
}
