import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import tseService from '../../services/tseService';
import verificacionService from '../../services/verificacionService';
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Home, Loader2, CheckCircle2, XCircle, Globe, User, Mail, Send } from 'lucide-react';

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
    // Estado para tipo de identificación: 'nacional' o 'extranjero'
    const [tipoIdentificacion, setTipoIdentificacion] = useState('nacional');
    
    // Estados para verificación de email
    const [emailVerificado, setEmailVerificado] = useState(false);
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [enviandoCodigo, setEnviandoCodigo] = useState(false);
    const [verificandoCodigo, setVerificandoCodigo] = useState(false);
    const [codigoIngresado, setCodigoIngresado] = useState('');

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
            // Arreglando el bypass: si la cédula cambia después de validación, limpiar todo
            if (cedulaValidada) {
                setCedulaValidada(false);
                setTseError('');
                // Limpiar los datos autocompletados del TSE
                setRegisterData(prev => ({
                    ...prev,
                    [name]: value,
                    nombre: '',
                    primer_apellido: '',
                    segundo_apellido: '',
                    fecha_nacimiento: '',
                    edad: '',
                    nacionalidad: ''
                }));
                return; // Ya actualizamos el state y luego salir
            }
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

    // Manejar cambio de tipo de identificación (Nacional/Extranjero)
    const handleTipoIdentificacionChange = (tipo) => {
        setTipoIdentificacion(tipo);
        setCedulaValidada(false);
        setTseError('');
        
        // Limpiar campos de nombre si cambia el tipo
        setRegisterData(prev => ({
            ...prev,
            nombre: '',
            primer_apellido: '',
            segundo_apellido: '',
            fecha_nacimiento: '',
            edad: '',
            nacionalidad: tipo === 'extranjero' ? 'EXTRANJERO' : ''
        }));
        
        if (tipo === 'extranjero') {
            toast({
                title: "Modo Extranjero",
                description: "Complete todos los datos manualmente.",
                className: "bg-blue-500 text-white",
            });
        }
    };

    // Función para enviar el código de verificación al email
    const handleEnviarCodigo = async () => {
        const email = registerData.email.trim();
        
        if (!email) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor ingrese su email primero.",
            });
            return;
        }
        
        // Validar formato básico de email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "El formato del email no es válido.",
            });
            return;
        }
        
        setEnviandoCodigo(true);
        
        try {
            const resultado = await verificacionService.enviarCodigo(email);
            
            if (resultado.success) {
                setCodigoEnviado(true);
                toast({
                    title: "Código enviado",
                    description: "Revisa tu bandeja de entrada. El código expira en 15 minutos.",
                    className: "bg-green-500 text-white",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: resultado.error,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo enviar el código. Intente de nuevo.",
            });
        } finally {
            setEnviandoCodigo(false);
        }
    };

    // Función para verificar el código ingresado
    const handleVerificarCodigo = async () => {
        const email = registerData.email.trim();
        const codigo = codigoIngresado.trim();
        
        if (!codigo || codigo.length !== 6) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Ingrese el código de 6 dígitos.",
            });
            return;
        }
        
        setVerificandoCodigo(true);
        
        try {
            const resultado = await verificacionService.verificarCodigo(email, codigo);
            
            if (resultado.success) {
                setEmailVerificado(true);
                toast({
                    title: "Email verificado ✓",
                    description: "Tu correo ha sido verificado exitosamente.",
                    className: "bg-green-500 text-white",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Código inválido",
                    description: resultado.error,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al verificar el código.",
            });
        } finally {
            setVerificandoCodigo(false);
        }
    };

    // Reset verificación cuando cambia el email
    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setRegisterData(prev => ({ ...prev, email: newEmail }));
        
        // Si el email cambia después de verificación, resetear
        if (emailVerificado || codigoEnviado) {
            setEmailVerificado(false);
            setCodigoEnviado(false);
            setCodigoIngresado('');
        }
    };

    // Verificar automáticamente cuando el código tiene 6 dígitos
    useEffect(() => {
        if (codigoIngresado.length === 6 && codigoEnviado && !emailVerificado && !verificandoCodigo) {
            handleVerificarCodigo();
        }
    }, [codigoIngresado]);

    // Validar cedula con TSE cuando el usuario sale del campo
    const handleCedulaBlur = async () => {
        // Solo validar TSE si es tipo NACIONAL
        if (tipoIdentificacion !== 'nacional') {
            return;
        }
        
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
                
                // Disparar evento para que el proveedor de tema detecte el cambio de rol
                window.dispatchEvent(new Event('auth-change'));

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

        // Validar que el email esté verificado
        if (!emailVerificado) {
            toast({
                variant: "destructive",
                title: "Email no verificado",
                description: "Por favor verifica tu email antes de continuar.",
            });
            setLoading(false);
            return;
        }

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
        <div className="flex justify-center items-center min-h-[80vh] bg-background p-4 relative bg-[url('/pattern.svg')]">
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
                                {/* Selector Nacional/Extranjero */}
                                <div className="flex rounded-lg bg-muted p-1 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => handleTipoIdentificacionChange('nacional')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                            tipoIdentificacion === 'nacional'
                                                ? 'bg-background text-primary shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <User className="h-4 w-4" />
                                        Nacional
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTipoIdentificacionChange('extranjero')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                            tipoIdentificacion === 'extranjero'
                                                ? 'bg-background text-primary shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Globe className="h-4 w-4" />
                                        Extranjero
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            {tipoIdentificacion === 'nacional' ? 'Cédula' : 'Identificación'}
                                            {tipoIdentificacion === 'nacional' && validandoTSE && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                            {tipoIdentificacion === 'nacional' && cedulaValidada && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder={tipoIdentificacion === 'nacional' ? 'Ej: 101110111' : 'Número de identificación'}
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
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            Email
                                            {emailVerificado && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                            {codigoEnviado && !emailVerificado && (
                                                <span className="text-xs text-green-600 animate-in fade-in duration-300">✓ Código enviado</span>
                                            )}
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="correo@ejemplo.com"
                                            className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                emailVerificado ? 'border-green-500 bg-green-50' : 'border-input bg-background'
                                            }`}
                                            value={registerData.email}
                                            onChange={handleEmailChange}
                                            disabled={emailVerificado || codigoEnviado}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Fila: Nombre + Botón Verificar Email */}
                                <div className="grid grid-cols-2 gap-4">
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">&nbsp;</label>
                                        {!emailVerificado ? (
                                            !codigoEnviado ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleEnviarCodigo}
                                                    disabled={enviandoCodigo || !registerData.email}
                                                    className="h-10 w-full"
                                                >
                                                    {enviandoCodigo ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Enviando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Verificar Email
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                /* Input de código con verificación automática */
                                                <div className="flex gap-12 justify-end animate-in slide-in-from-right-4 duration-300">
                                                    <input
                                                        type="text"
                                                        placeholder="000000"
                                                        maxLength={6}
                                                        className={`flex h-10 w-20 rounded-md border px-2 py-2 text-sm text-center tracking-widest font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                                            verificandoCodigo 
                                                                ? 'border-blue-400 bg-blue-50 focus-visible:ring-blue-500' 
                                                                : 'border-input bg-background focus-visible:ring-ring'
                                                        }`}
                                                        value={codigoIngresado}
                                                        onChange={(e) => setCodigoIngresado(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        disabled={verificandoCodigo}
                                                        autoFocus
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleEnviarCodigo}
                                                        disabled={enviandoCodigo}
                                                        className="h-10 px-2 text-xs"
                                                    >
                                                        {enviandoCodigo ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            'Reenviar'
                                                        )}
                                                    </Button>
                                                </div>
                                            )
                                        ) : (
                                            <div className="h-10 flex items-center justify-center text-green-600 font-medium animate-in zoom-in duration-300">
                                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                                Verificado
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mensaje de ayuda para el código */}
                                {codigoEnviado && !emailVerificado && (
                                    <p className="text-xs text-muted-foreground -mt-2 animate-in fade-in duration-500">
                                        Revisa tu bandeja de entrada. Ingresa el código de 6 dígitos. Expira en 15 min.
                                    </p>
                                )}

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