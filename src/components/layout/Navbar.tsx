import { ShoppingCart, Search, User, Menu, LogOut, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">StepUp</div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('nav.search')}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/catalog" className="text-sm font-medium hover:text-primary transition-smooth">
              {t('nav.catalog')}
            </Link>
            <Link to="/catalog?category=men" className="text-sm font-medium hover:text-primary transition-smooth">
              {t('nav.men')}
            </Link>
            <Link to="/catalog?category=women" className="text-sm font-medium hover:text-primary transition-smooth">
              {t('nav.women')}
            </Link>
            <Link to="/catalog?sale=true" className="text-sm font-medium text-secondary hover:text-secondary-hover transition-smooth">
              {t('nav.sale')}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" asChild className="hidden md:flex">
              <Link to="/flick-login">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account">{t('nav.account')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link 
                    to="/catalog" 
                    className="text-lg font-medium hover:text-primary transition-smooth"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.catalog')}
                  </Link>
                  <Link 
                    to="/catalog?category=men" 
                    className="text-lg font-medium hover:text-primary transition-smooth"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.men')}
                  </Link>
                  <Link 
                    to="/catalog?category=women" 
                    className="text-lg font-medium hover:text-primary transition-smooth"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.women')}
                  </Link>
                  <Link 
                    to="/catalog?sale=true" 
                    className="text-lg font-medium text-secondary hover:text-secondary-hover transition-smooth"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.sale')}
                  </Link>
                  <hr className="my-2" />
                  <Link 
                    to="/flick-login" 
                    className="text-lg font-medium hover:text-primary transition-smooth flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5" />
                    Chat
                  </Link>
                  {user ? (
                    <>
                      <Link 
                        to="/account" 
                        className="text-lg font-medium hover:text-primary transition-smooth flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        {t('nav.account')}
                      </Link>
                      <button 
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="text-lg font-medium hover:text-primary transition-smooth flex items-center gap-2 text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/auth" 
                      className="text-lg font-medium hover:text-primary transition-smooth"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('nav.search')}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
