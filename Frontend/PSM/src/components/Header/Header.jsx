import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import authService from '../../services/authService.jsx';
import { AlternadorTema } from '../ui/alternador-tema.jsx';

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);

    if (isAuth) {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full min-w-[375px] border-b bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-background/60 border-border/40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          <div className="mr-4 hidden md:flex items-center">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl lg:text-2xl whitespace-nowrap">
                Puntarenas Se Mueve
              </span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={`${navigationMenuTriggerStyle()} text-base`}>
                    Inicio
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/calendario" className={`${navigationMenuTriggerStyle()} text-base`}>
                    Calendario
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/contacto" className={`${navigationMenuTriggerStyle()} text-base`}>
                    Contacto
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="md:hidden flex-1">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-base whitespace-nowrap">
                Puntarenas Se Mueve
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <AlternadorTema />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="lg" className="bg-[#F25C05] hover:bg-[#D94D04] text-base">
                    <User className="h-5 w-5 mr-2" />
                    {user?.first_name} {user?.last_name?.split(' ')[0] || ''}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/sesion">
                <Button variant="default" size="md" className="bg-[#F25C05] hover:bg-[#D94D04] text-base">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-4">
                  <Link to="/" className="text-base font-medium transition-colors hover:text-primary">
                    Inicio
                  </Link>
                  <Link to="/calendario" className="text-base font-medium transition-colors hover:text-primary">
                    Calendario
                  </Link>
                  <Link to="/contacto" className="text-base font-medium transition-colors hover:text-primary">
                    Contacto
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-muted-foreground">
                            Hola, {user?.first_name || user?.username}
                          </p>
                          <AlternadorTema />
                        </div>
                        <Link to="/perfil" className="block">
                          <Button variant="outline" className="w-full mb-2" size="lg">
                            <User className="h-5 w-5 mr-2" />
                            Ver Perfil
                          </Button>
                        </Link>
                        <Button className="w-full bg-[#F25C05] hover:bg-[#D94D04]" onClick={handleLogout} size="lg">
                          <LogOut className="h-5 w-5 mr-2" />
                          Cerrar Sesión
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mt-4 mb-2">
                        <span className="text-sm font-medium">Tema</span>
                        <AlternadorTema />
                      </div>
                      <Link to="/sesion">
                        <Button className="w-full bg-[#F25C05] hover:bg-[#D94D04]" size="lg">Iniciar Sesión</Button>
                      </Link>
                    </>
                  )}
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