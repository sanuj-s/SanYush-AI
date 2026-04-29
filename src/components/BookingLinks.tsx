import { Plane, Building2, ExternalLink } from "lucide-react";

interface BookingLinksProps {
  destination: string;
}

export default function BookingLinks({ destination }: BookingLinksProps) {
  const encodedDest = encodeURIComponent(destination);
  
  // Real-world deep links for quick booking
  const skyscannerUrl = `https://www.skyscanner.net/transport/flights/any/${encodedDest}`;
  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodedDest}`;
  const airbnbUrl = `https://www.airbnb.com/s/${encodedDest}/homes`;

  return (
    <div className="glass-card rounded-[1.5rem] p-5 mt-2 group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
            <ExternalLink className="w-4 h-4" />
          </span>
          Live Booking Links
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <a 
          href={skyscannerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 p-3 rounded-xl flex items-center justify-between transition-colors group/link"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover/link:bg-blue-500/30 transition-colors">
              <Plane className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Search Flights</span>
          </div>
          <span className="text-xs font-semibold opacity-70 group-hover/link:opacity-100 transition-opacity">Skyscanner →</span>
        </a>

        <a 
          href={bookingUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 p-3 rounded-xl flex items-center justify-between transition-colors group/link"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg group-hover/link:bg-indigo-500/30 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Find Hotels</span>
          </div>
          <span className="text-xs font-semibold opacity-70 group-hover/link:opacity-100 transition-opacity">Booking.com →</span>
        </a>

        <a 
          href={airbnbUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-center justify-between transition-colors group/link"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg group-hover/link:bg-rose-500/30 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Find Stays</span>
          </div>
          <span className="text-xs font-semibold opacity-70 group-hover/link:opacity-100 transition-opacity">Airbnb →</span>
        </a>
      </div>
    </div>
  );
}
