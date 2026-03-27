import { useEffect, useState } from 'react';

const CORNELL_FACTS = [
  'If you stand under McGraw Tower at noon, the chimes are loud enough to feel in your chest.',
  'The walk from Collegetown to central campus via Cascadilla is ~300+ stone steps uphill.',
  'Duffield Hall connects to multiple engineering buildings so you can stay indoors most of winter.',
  'Uris Library cocktail lounge = one of the quietest (and most aesthetic) study spots.',
  'Olin Library basement is where people go when it’s too late to be productive but too early to quit.',
  'Ho Plaza has a map of the world made of stones — people try to find their hometown.',
  'The slope from Libe Slope to Ho Plaza is steeper than it looks — especially in snow.',
  'Temple of Zeus (Goldwin Smith Hall Atrium) is warm enough that people accidentally fall asleep mid-study.',
  'Statler Hall’s hotel rooms are bookable by the public, run by students.',
  'Cornell Dairy Bar lines get longest right after dinner hours.',
  'The wind tunnel between Phillips Hall and Duffield can make 20°F feel like 5°F.',
  'Beebe Lake looks frozen solid, but students are warned not to trust the ice.',
  'Cascadilla Gorge Trail is closed in winter because the stairs become literal ice sheets.',
  'Arts Quad goes from empty to packed the first sunny 60°F day.',
  'Okenshields Dining Hall has rotating menus that people check online before going.',
  'TCAT buses fill up so fast at peak hours that you sometimes watch yours drive past full.',
  'The walk from North Campus to central can take 15–20 minutes uphill.',
  'Sage Chapel bells ring so often you stop noticing them after a week.',
  'Clark Hall has labs where undergrads work on real robotics and AI research.',
  'Rhodes Hall is where many CS students spend most of their late nights.',
  'During prelim season, libraries stay so full that finding a seat becomes competitive.',
  'Willard Straight Hall has study rooms that are almost always booked during finals.',
  'The suspension bridge near Fall Creek Gorge sways slightly — and everyone notices the first time.',
  'Cornell’s hills mean your step count hits 10k+ just going to class.',
  'The snow piles on sidewalks get so high that they turn into walls by February.',
  'Kennedy Hall is home to fiber science — one of the most niche majors in the country.',
  'Students time their walks to avoid being outside when lake-effect wind picks up.',
  'Bartels Hall is where people go to de-stress with gyms or intramurals.',
  'The first warm day makes campus feel like a completely different school overnight.',
  'Everyone has at least one moment where they realize: “wow, Cornell is actually really big.”',
  'If you take the slope behind Morrill Hall, you get one of the best sunset views on campus.',
  'The walk past Balch Hall in winter is brutally windy because it’s fully exposed.',
  'PSB (Physical Sciences Building) has glass study areas that feel like a greenhouse when it’s sunny.',
  'The doors in Goldwin Smith Hall are confusing enough that people walk in circles.',
  'Klarman Hall is known for its huge open interior where sound carries everywhere.',
  'If you walk through Kennedy Hall, you’ll sometimes see textile projects hanging in hallways.',
  'The path behind Stocking Hall smells like food because of dairy and food science labs.',
  'Milstein Hall has a rooftop studio space architecture students use late at night.',
  'The bridge near Thurston Avenue Bridge gives a straight-down view into the gorge that surprises people.',
  'Carpenter Hall has 24/7 studio culture — lights are on basically all night.',
  'The walk from West Campus to central feels short downhill and twice as long uphill.',
  'Noyes Community Recreation Center gets busiest late at night, not during the day.',
  'Some classrooms in Hollister Hall feel hidden because they’re tucked into corners.',
  'Rand Hall used to be messy studios — now it’s a super clean architecture space.',
  'If you sit near windows in ILR School Building, you get one of the best quiet views of campus.',
  'The hallway in Baker Laboratory always smells faintly like chemicals.',
  'Rockefeller Hall lecture rooms are where many intro classes pack in hundreds of students.',
  'Bailey Hall hosts big lectures, concerts, and guest speakers.',
  'Human Ecology Building has some of the nicest interior lounges people don’t expect.',
  'Mann Library is quieter and less crowded than central libraries — if you know about it.',
  'The walk along Tower Road feels endless when it’s cold and windy.',
  'Vet School Complex is so far it feels like a different campus.',
  'The slope behind Johnson Museum of Art has one of the best views of Cayuga Lake.',
  'Inside Johnson Museum of Art, the top floor is a quiet spot people stumble into by accident.',
  'Bradfield Hall has plant science labs where you’ll see growth chambers and experiments.',
  'Comstock Hall is where insect science happens — sometimes literally with live specimens.',
  'Weill Hall is one of the newest, nicest science buildings on campus.',
  'The path near Plantations (Cornell Botanic Gardens) is quiet even during busy days.',
  'Lynah Rink hockey games get loud enough to hear from outside.',
  'Walking across campus during peak class time means constantly dodging people rushing in every direction.',
];

export default function RotatingFactsPanel({ warning }) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFactIndex(current => (current + 1) % CORNELL_FACTS.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="mt-5 w-full max-w-2xl rounded-3xl border border-fuchsia-400/15 bg-white/5 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <div className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/80">While You Wait</div>
      <p className="mt-2 text-base font-medium text-amber-300">{warning}</p>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Fun fact</div>
        <p className="mt-2 text-lg leading-7 text-amber-300">{CORNELL_FACTS[factIndex]}</p>
      </div>
      <p className="mt-3 text-xs text-gray-500">Rotates every 5 seconds.</p>
    </div>
  );
}
