import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-secondary/40'}`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-full" style={{ background: 'var(--gradient-brand)' }} />
          <span className="font-display text-lg">rabt.</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <a href="#services" className="px-3 py-2 rounded-md text-sm hover:bg-secondary/40">Services</a>
          <a href="#work" className="px-3 py-2 rounded-md text-sm hover:bg-secondary/40">Work</a>
          <a href="#about" className="px-3 py-2 rounded-md text-sm hover:bg-secondary/40">About</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/onboarding">
            <Button variant="hero" size="lg" className="hover-scale">Start Onboarding</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
