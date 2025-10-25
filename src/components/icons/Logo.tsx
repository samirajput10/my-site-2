
import Link from 'next/link';
import { Shirt } from 'lucide-react'; 

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Shirt className="h-7 w-7 text-white group-hover:text-[#6E8CFB] transition-colors" />
      <h1 className="text-xl font-bold text-white group-hover:text-[#6E8CFB] transition-colors">
        Velbric
      </h1>
    </Link>
  );
}
