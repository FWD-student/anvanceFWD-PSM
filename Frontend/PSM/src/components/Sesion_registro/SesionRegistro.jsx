import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import tseService from '../../services/tseService';
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const SesionRegistro = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const [tipoForm, setTipoForm] = useState('login'); // 'login' or 'registro'
    const [loading, setLoading] = useState(false);
    
    // Estados para validación TSE
    const [validandoTSE, setValidandoTSE] = useState(false);
    const [cedulaValidada, setCedulaValidada] = useState(false);
    const [tseError, setTseError] = useState('');

    useEffect(() => {
        if (searchParams.get('view') === 'registro') {
            setTipoForm('registro');
        }
    }, [searchParams]);

    // inicio de sesion
    const [loginData, setLoginData] = useState({ username: '', password: '' });

    // registro
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        nombre: '', // first_name
        primer_apellido: '', // Normalizado
        segundo_apellido: '', // Normalizado
        telefono: '',
        edad: '',
        fecha_nacimiento: '',
        nacionalidad: '' // Campo para TSE o EXTRANJERO
    });

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const limpiarCampos = () => {
        setLoginData({ username: '', password: '' });
    };

    const handleRegisterChange = (e) => {
        let { name, value } = e.target;
        
        // Es cedula, solo permitir numeros
        if (name === 'username') {
            value = value.replace(/[^0-9]/g, '');
            setCedulaValidada(false);
            setTseError('');
        }
        
        setRegisterData(prev => {
            const newData = { ...prev, [name]: value };

            // Calcular edad si cambia la fecha de nacimiento
            if (name === 'fecha_nacimiento') {
                const birthDate = new Date(value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                newData.edad = age >= 0 ? age : '';
            }
            return newData;
        });
    };

    // Validar cedula con TSE cuando el usuario sale del campo
    const handleCedulaBlur = async () => {
        const cedula = registerData.username.trim();
        
        // Si la cedula esta vacia o tiene menos de 9 caracteres, no validar
        if (!cedula || cedula.replace(/[^0-9]/g, '').length < 9) {
            return;
        }
        
        // Si ya esta validada, no volver a validar
        if (cedulaValidada) {
            return;
        }
        
        setValidandoTSE(true);
        setTseError('');
        
        try {
            const resultado = await tseService.validarCedula(cedula);
            
            if (resultado.success) {
                // Para autocompletar campos con datos del TSE
                const fechaNac = resultado.data.fechaNacimiento;
                let edadCalculada = '';
                
                // Calcular edad desde fecha de nacimiento
                if (fechaNac) {
                    const birthDate = new Date(fechaNac);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    edadCalculada = age >= 0 ? age : '';
                }
                
                setRegisterData(prev => ({
                    ...prev,
                    nombre: resultado.data.nombre || '',
                    primer_apellido: resultado.data.primerApellido || '',
                    segundo_apellido: resultado.data.segundoApellido || '',
                    fecha_nacimiento: fechaNac || '',
                    edad: edadCalculada,
                    nacionalidad: resultado.data.nacionalidad || 'COSTARRICENSE'
                }));
                
                setCedulaValidada(true);
                toast({
                    title: "Cédula validada",
                    description: `Datos obtenidos del TSE para ${resultado.data.nombreCompleto}`,
                    className: "bg-green-500 text-white",
                });
            } else {
                // Cedula no encontrada en TSE, permitir registro como EXTRANJERO
                setRegisterData(prev => ({
                    ...prev,
                    nacionalidad: 'EXTRANJERO'
                }));
                setCedulaValidada(false); // Permitir edicion manual
                setTseError(''); // Limpiar error, no es un error o solo no se encontro
                toast({
                    title: "Cédula no encontrada en TSE",
                    description: "Complete los datos manualmente. Se registrará como EXTRANJERO.",
                    className: "bg-yellow-500 text-white",
                });
            }
        } catch (error) {
            console.error('Error validando cédula:', error);
            // En caso de error de conexion, permitir registro manual
            toast({
                variant: "destructive",
                title: "Error de conexión",
                description: "No se pudo conectar con el TSE. Complete los datos manualmente.",
            });
        } finally {
            setValidandoTSE(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login(loginData.username, loginData.password);
            console.log("Login successful:", response);

            if (response.access) {
                localStorage.setItem('token', response.access);
                localStorage.setItem('refreshToken', response.refresh);

                toast({
                    title: "Inicio de sesión exitoso",
                    description: "Redirigiendo...",
                    className: "bg-green-500 text-white",
                });

                // El rol viene en la respuesta del backend, no en el token JWT
                const role = response.role || '';
                localStorage.setItem('userRole', role);  // Guardar rol para validación posterior

                const isAdminRole = role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrador';
                const targetPath = isAdminRole ? '/admin' : '/home';

                setTimeout(() => navigate(targetPath), 1500);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se recibió el token de acceso.",
                });
                limpiarCampos();
            }
        } catch (err) {
            console.error("Login error:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Credenciales inválidas o error en el servidor.",
            });
            limpiarCampos();
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // validacion simple
        if (registerData.password.length < 8) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "La contraseña debe tener al menos 8 caracteres.",
            });
            setLoading(false);
            return;
        }

        // Validacion de telefono (opcional)
        if (registerData.telefono && registerData.telefono.trim() !== '') {
            const numPermitido = /^[678]\d{7,15}$/;
            if (!numPermitido.test(registerData.telefono)) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "El teléfono debe empezar con 6, 7 u 8 y tener entre 8 y 16 dígitos.",
                });
                setLoading(false);
                return;
            }
        }

        try {
            await authService.register(
                registerData.username,
                registerData.nombre,
                registerData.primer_apellido,
                registerData.segundo_apellido,
                registerData.email,
                registerData.password,
                registerData.telefono,
                registerData.edad,
                registerData.fecha_nacimiento,
                registerData.nacionalidad
            );

            toast({
                title: "Registro exitoso",
                description: "Por favor inicia sesión.",
                className: "bg-green-500 text-white",
                });
            setTipoForm('login');
            setCedulaValidada(false); // Resetear estado de validación
            setRegisterData({
                username: '', email: '', password: '', nombre: '', primer_apellido: '', segundo_apellido: '', telefono: '', edad: '', fecha_nacimiento: '', nacionalidad: ''
            });
        } catch (err) {
            console.error("Register error:", err);
            
            // Parsear el mensaje de error para mostrar mensajes más claros
            let errorMessage = "Error al registrar. Verifica los datos o intenta más tarde.";
            
            try {
                const errorData = JSON.parse(err.message);
                
                // Verificar errores específicos del backend
                if (errorData.username) {
                    errorMessage = "Esta cédula ya está registrada. Por favor inicia sesión.";
                } else if (errorData.email) {
                    errorMessage = "Este correo electrónico ya está registrado.";
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (parseError) {
                // Si no se puede parsear, usar el mensaje original
                if (err.message.includes("username")) {
                    errorMessage = "Esta cédula ya está registrada.";
                } else if (err.message.includes("email")) {
                    errorMessage = "Este correo electrónico ya está registrado.";
                }
            }
            
            toast({
                variant: "destructive",
                title: "Error de Registro",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-background p-4 relative bg-[url('/path/to/pattern.svg')]">
                <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-md border-border/50 transition-all duration-300 relative">
                
                {/* Botón Flotante Volver */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 left-2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => navigate('/')}
                >
                    <Home className="h-5 w-5" />
                </Button>

                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-primary">
                        {tipoForm === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        {tipoForm === 'login' ? 'Bienvenido de vuelta' : 'Únete a la comunidad deportiva'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div key={tipoForm} className="animate-[fadeIn_0.4s_ease-out]">
                        <style>
                            {`
                                @keyframes fadeIn {
                                    from { opacity: 0; transform: translateY(10px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                            `}
                        </style>
                    {
                        tipoForm === 'login' ? (
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Usuario</label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tu numero de cedula"
                                        value={loginData.username}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contraseña</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Cargando..." : "Ingresar"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            Cédula
                                            {validandoTSE && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                            {cedulaValidada && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Ej: 101110111"
                                            className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                cedulaValidada ? 'border-green-500 bg-green-50' : 'border-input bg-background'
                                            }`}
                                            value={registerData.username}
                                            onChange={handleRegisterChange}
                                            onBlur={handleCedulaBlur}
                                            disabled={validandoTSE}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={registerData.email}
                                            onChange={handleRegisterChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                            cedulaValidada ? 'bg-muted cursor-not-allowed' : 'bg-background'
                                        }`}
                                        value={registerData.nombre}
                                        onChange={handleRegisterChange}
                                        readOnly={cedulaValidada}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Primer Apellido</label>
                                        <input
                                            type="text"
                                            name="primer_apellido"
                                            className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                cedulaValidada ? 'bg-muted cursor-not-allowed' : 'bg-background'
                                            }`}
                                            value={registerData.primer_apellido}
                                            onChange={handleRegisterChange}
                                            readOnly={cedulaValidada}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Segundo Apellido</label>
                                        <input
                                            type="text"
                                            name="segundo_apellido"
                                            className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                cedulaValidada ? 'bg-muted cursor-not-allowed' : 'bg-background'
                                            }`}
                                            value={registerData.segundo_apellido}
                                            onChange={handleRegisterChange}
                                            readOnly={cedulaValidada}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contraseña</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Teléfono (opcional)</label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={registerData.telefono}
                                            onChange={handleRegisterChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Edad</label>
                                        <input
                                            type="number"
                                            name="edad"
                                            value={registerData.edad}
                                            readOnly
                                            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        name="fecha_nacimiento"
                                        className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                            cedulaValidada ? 'bg-muted cursor-not-allowed' : 'bg-background'
                                        }`}
                                        value={registerData.fecha_nacimiento}
                                        onChange={handleRegisterChange}
                                        readOnly={cedulaValidada}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Registrando..." : "Registrarse"}
                                </Button>
                            </form>
                        )
                    }
                    </div>
                </CardContent >
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        {tipoForm === 'login' ? (
                            <>
                                ¿No tienes cuenta?{" "}
                                <button onClick={() => setTipoForm('registro')} className="text-primary hover:underline font-medium">
                                    Regístrate aquí
                                </button>
                            </>
                        ) : (
                            <>
                                ¿Ya tienes cuenta?{" "}
                                <button onClick={() => setTipoForm('login')} className="text-primary hover:underline font-medium">
                                    Inicia sesión aquí
                                </button>
                            </>
                        )}
                    </p>
                </CardFooter>
            </Card >
        </div >
    );
};

export default SesionRegistro;