import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full min-w-[375px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Desktop Navigation */}
          <div className="mr-4 hidden md:flex items-center">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-base lg:text-lg whitespace-nowrap">
                Puntarenas Se Mueve
              </span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={navigationMenuTriggerStyle()}>
                    Inicio
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/calendario" className={navigationMenuTriggerStyle()}>
                    Calendario
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/contacto" className={navigationMenuTriggerStyle()}>
                    Contacto
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Logo */}
          <div className="md:hidden flex-1">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-sm whitespace-nowrap">
                Puntarenas Se Mueve
              </span>
            </Link>
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:flex items-center">
            <Link to="/sesion">
              <Button variant="default" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-4">
                  <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                    Inicio
                  </Link>
                  <Link to="/calendario" className="text-sm font-medium transition-colors hover:text-primary">
                    Calendario
                  </Link>
                  <Link to="/contacto" className="text-sm font-medium transition-colors hover:text-primary">
                    Contacto
                  </Link>
                  <Link to="/sesion">
                    <Button className="w-full">Iniciar Sesión</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;