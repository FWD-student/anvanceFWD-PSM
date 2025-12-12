import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, Users, MessageSquare, LogOut, Menu, X, UserCog, Settings, Home } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from 'framer-motion';
import { AlternadorTema } from '../ui/alternador-tema.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

// Variantes de animación para las transiciones de página
const pageVariants = {
    initial: {
        opacity: 0,
        x: 20,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    exit: {
        opacity: 0,
        x: -20,
        scale: 0.98,
        transition: {
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'usuarios', label: 'Usuarios', icon: UserCog, path: '/admin/usuarios' },
        { id: 'eventos', label: 'Eventos', icon: Calendar, path: '/admin/eventos' },
        { id: 'ubicaciones', label: 'Ubicaciones', icon: MapPin, path: '/admin/ubicaciones' },
        { id: 'inscripciones', label: 'Inscripciones', icon: Users, path: '/admin/inscripciones' },
        { id: 'asistencia', label: 'Asistencia', icon: Users, path: '/admin/asistencia' },
        { id: 'resenas', label: 'Reseñas', icon: MessageSquare, path: '/admin/resenas' },
        { id: 'configuracion', label: 'Configuración', icon: Settings, path: '/admin/configuracion' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        navigate('/sesion');
    };

    useEffect(() => {
        const checkSession = () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp < currentTime) {
                    handleLogout();
                }
            } catch (error) {
                handleLogout();
            }
        };

        checkSession();
        const interval = setInterval(checkSession, 60000);
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background transition-colors duration-300">
            {/* Sidebar con gradiente elegante */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl`}
            >
                {/* Top bar: Home + Tema */}
                <div className="p-3 flex items-center justify-between border-b border-white/15 bg-white/5">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 text-sm font-medium"
                    >
                        <Home size={18} />
                        {sidebarOpen && <span>Inicio</span>}
                    </button>
                    <div className="[&_button]:bg-white/15 [&_button]:border-white/30 [&_button]:text-white [&_button]:hover:bg-white/25 [&_svg]:text-white">
                        <AlternadorTema />
                    </div>
                </div>

                {/* Header del sidebar */}
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                    {sidebarOpen && (
                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                        >
                            PSM Admin
                        </motion.h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navegación con animaciones */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/admin'
                            ? location.pathname === '/admin' || location.pathname === '/admin/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                {/* Indicador activo */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon size={20} className={`transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                                {sidebarOpen && (
                                    <span className="font-medium text-sm">{item.label}</span>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Footer: Logout */}
                <div className="p-3 border-t border-white/15">
                    <button
                        onClick={() => setConfirmLogoutOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-400/30 text-red-300 hover:text-red-200 transition-all duration-200"
                    >
                        <LogOut size={18} />
                        {sidebarOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Área de contenido principal con transiciones */}
            <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/30">
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Dialog de confirmación de cerrar sesión */}
            <Dialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Cerrar sesión?</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas cerrar tu sesión de administrador?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmLogoutOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleLogout}>Sí, cerrar sesión</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AdminLayout;