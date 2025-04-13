
import { Flag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-f1-red" />
          <p className="text-sm text-muted-foreground">
            © 2025 P10 Pursuit. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-checkered-pattern rounded-full"></div>
          <div className="h-4 w-4 bg-f1-red rounded-full"></div>
          <div className="h-4 w-4 bg-checkered-pattern rounded-full"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
