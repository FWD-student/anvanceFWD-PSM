import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, Users, MessageSquare, LogOut, Menu, X, UserCog, ShieldAlert } from 'lucide-react';
import { jwtDecode } from "jwt-decode";

function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'usuarios', label: 'Usuarios', icon: UserCog, path: '/admin/usuarios' },
        { id: 'eventos', label: 'Eventos', icon: Calendar, path: '/admin/eventos' },
        { id: 'ubicaciones', label: 'Ubicaciones', icon: MapPin, path: '/admin/ubicaciones' },
        { id: 'inscripciones', label: 'Inscripciones', icon: Users, path: '/admin/inscripciones' },
        { id: 'asistencia', label: 'Asistencia', icon: Users, path: '/admin/asistencia' }, // Nuevo item
        { id: 'resenas', label: 'Reseñas', icon: MessageSquare, path: '/admin/resenas' },
        { id: 'configuracion', label: 'Configuración', icon: ShieldAlert, path: '/admin/configuracion' }, // Usando ShieldAlert temporalmente o importar Settings si existe
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

        // actualizar al instante
        checkSession();

        // Chequear cada minuto
        const interval = setInterval(checkSession, 60000);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background transition-colors duration-300">

            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}
            >
                <div className="p-4 flex items-center justify-between border-b border-blue-700">
                    {sidebarOpen && <h1 className="text-xl font-bold">PSM Admin</h1>}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        /* Verificar si la ruta actual coincide con el path del item */
                        const isActive = item.path === '/admin'
                            ? location.pathname === '/admin' || location.pathname === '/admin/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-blue-700 shadow-lg'
                                    : 'hover:bg-blue-700/50'
                                    }`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-blue-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;