import { redirect } from 'next/navigation';

// The schedule is the home of the panel for both profiles.
export default function HomePage() {
  redirect('/agenda');
}
