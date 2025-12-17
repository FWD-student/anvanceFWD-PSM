import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Search, User, Trash2, Loader2, RefreshCw, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import UserService from '../../services/userService';
import AuthService from '../../services/authService';
import UserGroupService from '../../services/userGroupService';
import tseService from '../../services/tseService';

// Componente para gestionar usuarios
// Permite crear, editar, eliminar y validar cedulas con TSE
function UsuariosAdmin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [validatingTSE, setValidatingTSE] = useState(false);
    const [tseValidated, setTseValidated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        telefono: '',
        edad: '',
        fecha_nacimiento: '',
        nacionalidad: '',
        role: 'user' // 'user' or 'admin'
    });

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    // Carga lista de usuarios desde el backend
    const obtenerUsuarios = async () => {
        setLoading(true);
        try {
            const data = await UserService.getUsers();
            setUsers(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los usuarios.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Generar contraseña aleatoria segura
    const generarPasswordAleatorio = () => {
        const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const minusculas = 'abcdefghijklmnopqrstuvwxyz';
        const numeros = '0123456789';
        const especiales = '!@#$%&*';
        
        let password = '';
        // Asegurar al menos uno de cada tipo
        password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
        password += minusculas[Math.floor(Math.random() * minusculas.length)];
        password += numeros[Math.floor(Math.random() * numeros.length)];
        password += especiales[Math.floor(Math.random() * especiales.length)];
        
        // Completar hasta 12 caracteres
        const todos = mayusculas + minusculas + numeros + especiales;
        for (let i = 0; i < 8; i++) {
            password += todos[Math.floor(Math.random() * todos.length)];
        }
        
        // Mezclar
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        setFormData(prev => ({ ...prev, password }));
        setShowPassword(true);
        
        toast({
            title: "Contraseña generada",
            description: "Se ha generado una contraseña segura.",
        });
    };

    // Calcular edad desde fecha de nacimiento
    const calcularEdadDesdeFecha = (fechaNacimiento) => {
        if (!fechaNacimiento) return '';
        
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const mesNacimiento = nacimiento.getMonth();
        
        if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        
        return edad > 0 ? edad : '';
    };

    // Validar cédula con TSE
    const validarCedulaTSE = async (cedula) => {
        // Limpiar la cédula de guiones
        const cedulaLimpia = cedula.replace(/-/g, '');
        
        // Si tiene más de 9 dígitos, es extranjero
        if (cedulaLimpia.length > 9) {
            setFormData(prev => ({
                ...prev,
                nacionalidad: 'EXTRANJERO'
            }));
            setTseValidated(false);
            toast({
                title: "Cédula extranjera",
                description: "La cédula tiene más de 9 dígitos. Se cataloga como extranjero.",
            });
            return;
        }
        
        // Si tiene menos de 9 dígitos, esperar
        if (cedulaLimpia.length < 9) {
            return;
        }
        
        setValidatingTSE(true);
        try {
            const resultado = await tseService.validarCedula(cedulaLimpia);
            
            if (resultado.success) {
                setFormData(prev => ({
                    ...prev,
                    nombre: resultado.data.nombre || prev.nombre,
                    primer_apellido: resultado.data.primerApellido || prev.primer_apellido,
                    segundo_apellido: resultado.data.segundoApellido || prev.segundo_apellido,
                    fecha_nacimiento: resultado.data.fechaNacimiento || prev.fecha_nacimiento,
                    nacionalidad: resultado.data.nacionalidad || 'COSTARRICENSE',
                    edad: resultado.data.edad || calcularEdadDesdeFecha(resultado.data.fechaNacimiento) || prev.edad
                }));
                setTseValidated(true);
                toast({
                    title: "Cédula válida",
                    description: "Datos obtenidos del TSE correctamente.",
                });
            } else {
                // No se encontró en TSE, marcar como extranjero
                setFormData(prev => ({
                    ...prev,
                    nacionalidad: 'EXTRANJERO'
                }));
                setTseValidated(false);
                toast({
                    title: "Cédula no encontrada",
                    description: "No se encontró en el TSE. Se cataloga como extranjero.",
                });
            }
        } catch (error) {
            console.error('Error validando TSE:', error);
            setTseValidated(false);
        } finally {
            setValidatingTSE(false);
        }
    };

    // Maneja cambios de input y filtra cedula
    const manejarCambioInput = (e) => {
        const { name, value } = e.target;
        
        // Si es cédula, solo permitir números y guiones
        if (name === 'username') {
            const valorFiltrado = value.replace(/[^0-9-]/g, '');
            setFormData(prev => ({ ...prev, [name]: valorFiltrado }));
            setTseValidated(false);
            return;
        }
        
        // Si es fecha de nacimiento, calcular edad automáticamente
        if (name === 'fecha_nacimiento') {
            const edadCalculada = calcularEdadDesdeFecha(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                edad: edadCalculada
            }));
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const manejarBlurCedula = () => {
        const cedulaLimpia = formData.username.replace(/-/g, '');
        if (cedulaLimpia.length >= 9) {
            validarCedulaTSE(formData.username);
        }
    };

    const manejarCambioRol = (value) => {
        setFormData(prev => ({
            ...prev,
            role: value
        }));
    };

    const iniciarEdicion = (user) => {
        setEditingId(user.id);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            nombre: user.first_name || '',
            primer_apellido: user.primer_apellido || '',
            segundo_apellido: user.segundo_apellido || '',
            telefono: user.telefono || '',
            edad: user.edad || '',
            fecha_nacimiento: user.fecha_nacimiento || '',
            nacionalidad: user.nacionalidad || '',
            role: user.is_staff ? 'admin' : 'user'
        });
        setTseValidated(false);
        setShowPassword(false);
        setIsDialogOpen(true);
    };

    const abrirDialogoNuevo = () => {
        limpiarFormulario();
        setIsDialogOpen(true);
    };

    const limpiarFormulario = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            nombre: '',
            primer_apellido: '',
            segundo_apellido: '',
            telefono: '',
            edad: '',
            fecha_nacimiento: '',
            nacionalidad: '',
            role: 'user'
        });
        setEditingId(null);
        setTseValidated(false);
        setShowPassword(false);
        setIsDialogOpen(false);
    };

    // Abre dialogo de confirmacion para borrar
    const confirmarEliminar = (user) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const eliminarUsuario = async () => {
        if (!userToDelete) return;
        
        setDeleting(true);
        try {
            await UserService.deleteUser(userToDelete.id);
            toast({
                title: "Éxito",
                description: "Usuario eliminado correctamente.",
            });
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
            obtenerUsuarios();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el usuario.",
            });
        } finally {
            setDeleting(false);
        }
    };

    // Valida campos antes de guardar
    const validarRegistro = () => {
        if (!formData.username || !formData.email || !formData.nombre || !formData.primer_apellido) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: "Por favor complete todos los campos obligatorios.",
            });
            return false;
        }
        
        // Validar password solo si es creación o si se escribió algo
        if (!editingId && !formData.password) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: "Debe ingresar o generar una contraseña.",
            });
            return false;
        }
        
        if (formData.password && formData.password.length < 6) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: "La contraseña debe tener al menos 6 caracteres.",
            });
            return false;
        }
        return true;
    };

    const guardarUsuario = async () => {
        if (!validarRegistro()) return;

        setCreating(true);
        try {
            if (editingId) {
                // ACTUALIZAR USUARIO EXISTENTE
                const updateData = {
                    username: formData.username,
                    email: formData.email,
                    first_name: formData.nombre,
                    primer_apellido: formData.primer_apellido,
                    segundo_apellido: formData.segundo_apellido,
                    telefono: formData.telefono,
                    edad: formData.edad,
                    fecha_nacimiento: formData.fecha_nacimiento,
                    nacionalidad: formData.nacionalidad,
                };
                
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await UserService.updateUser(editingId, updateData);
                
                if (formData.role === 'admin') {
                    await UserGroupService.asignarRole(editingId, 1);
                } else {
                    await UserGroupService.asignarRole(editingId, 0);
                }

                toast({
                    title: "Éxito",
                    description: "Usuario actualizado correctamente.",
                });

            } else {
                // CREAR NUEVO USUARIO
                const newUser = await AuthService.register(
                    formData.username,
                    formData.nombre,
                    formData.primer_apellido,
                    formData.segundo_apellido,
                    formData.email,
                    formData.password,
                    formData.telefono,
                    formData.edad,
                    formData.fecha_nacimiento,
                    formData.nacionalidad
                );

                // Marcar que debe cambiar password
                const userId = newUser.id || (newUser.user && newUser.user.id);
                if (userId) {
                    await UserService.updateUser(userId, { debe_cambiar_password: true });
                    
                    if (formData.role === 'admin') {
                        await UserGroupService.asignarRole(userId, 1);
                    }
                }

                toast({
                    title: "Éxito",
                    description: `Usuario creado correctamente. Contraseña temporal: ${formData.password}`,
                    duration: 10000, // 10 segundos para que pueda copiar
                });
            }

            limpiarFormulario();
            obtenerUsuarios();

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo guardar el usuario. Verifique los datos o si el usuario ya existe.",
            });
        } finally {
            setCreating(false);
        }
    };


    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-1">Administra los usuarios y sus permisos</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={abrirDialogoNuevo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Diálogo Crear/Editar Usuario */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) limpiarFormulario(); else setIsDialogOpen(true); }}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                        <DialogDescription>
                            {editingId ? 'Modifique los datos del usuario.' : 'Ingrese los datos del nuevo usuario.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Cédula *</Label>
                                <div className="relative">
                                    <Input 
                                        id="username" 
                                        name="username" 
                                        value={formData.username} 
                                        onChange={manejarCambioInput}
                                        onBlur={manejarBlurCedula}
                                        placeholder="123456789" 
                                    />
                                    {validatingTSE && (
                                        <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-blue-600" />
                                    )}
                                    {tseValidated && !validatingTSE && (
                                        <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-600" />
                                    )}
                                </div>
                                {formData.nacionalidad === 'EXTRANJERO' && (
                                    <p className="text-xs text-amber-600">Catalogado como extranjero</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico *</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={manejarCambioInput} placeholder="jdoe@example.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input 
                                    id="nombre" 
                                    name="nombre" 
                                    value={formData.nombre} 
                                    onChange={manejarCambioInput} 
                                    placeholder="John" 
                                    disabled={tseValidated}
                                    className={tseValidated ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="primer_apellido">Primer Apellido *</Label>
                                <Input 
                                    id="primer_apellido" 
                                    name="primer_apellido" 
                                    value={formData.primer_apellido} 
                                    onChange={manejarCambioInput} 
                                    placeholder="Pérez" 
                                    disabled={tseValidated}
                                    className={tseValidated ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                            <Input 
                                id="segundo_apellido" 
                                name="segundo_apellido" 
                                value={formData.segundo_apellido} 
                                onChange={manejarCambioInput} 
                                placeholder="González" 
                                disabled={tseValidated}
                                className={tseValidated ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña {editingId ? '(Opcional)' : '*'}</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type={showPassword ? "text" : "password"} 
                                        value={formData.password} 
                                        onChange={manejarCambioInput} 
                                        placeholder={editingId ? "Dejar en blanco para mantener actual" : "Escriba o genere una contraseña"}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-0 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button type="button" variant="outline" onClick={generarPasswordAleatorio} className="shrink-0">
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Generar
                                </Button>
                            </div>
                            {formData.password && !editingId && (
                                <p className="text-xs text-amber-600">⚠️ Guarde esta contraseña. El usuario deberá cambiarla en el primer inicio de sesión.</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input id="telefono" name="telefono" value={formData.telefono} onChange={manejarCambioInput} placeholder="88888888" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edad">Edad</Label>
                                <Input 
                                    id="edad" 
                                    name="edad" 
                                    type="number" 
                                    value={formData.edad} 
                                    onChange={manejarCambioInput} 
                                    placeholder="25" 
                                    readOnly 
                                    className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                            <Input 
                                id="fecha_nacimiento" 
                                name="fecha_nacimiento" 
                                type="date" 
                                value={formData.fecha_nacimiento} 
                                onChange={manejarCambioInput} 
                                disabled={tseValidated}
                                className={tseValidated ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nacionalidad">Nacionalidad</Label>
                            <Input 
                                id="nacionalidad" 
                                name="nacionalidad" 
                                value={formData.nacionalidad} 
                                onChange={manejarCambioInput} 
                                placeholder="COSTARRICENSE" 
                                disabled={tseValidated || formData.nacionalidad === 'EXTRANJERO'}
                                className={(tseValidated || formData.nacionalidad === 'EXTRANJERO') ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Rol de Usuario</Label>
                            <Select onValueChange={manejarCambioRol} value={formData.role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuario Regular</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={limpiarFormulario}>Cancelar</Button>
                        <Button onClick={guardarUsuario} disabled={creating} className="bg-green-600 hover:bg-green-700 text-white">
                            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo Confirmar Eliminación */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Eliminar Usuario</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro de que desea eliminar al usuario <strong>{userToDelete?.username}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={eliminarUsuario} 
                            disabled={deleting}
                        >
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Lista de Usuarios</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Buscar usuario..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Última Conexión</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No se encontraron usuarios
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="bg-blue-100 p-1 rounded-full">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                            {user.username}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{`${user.first_name || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim() || '-'}</TableCell>
                                        <TableCell>{user.telefono || '-'}</TableCell>
                                        <TableCell>
                                            {user.last_login 
                                                ? new Date(user.last_login).toLocaleDateString('es-CR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : <span className="text-muted-foreground">Nunca</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => iniciarEdicion(user)}>
                                                    Editar
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => confirmarEliminar(user)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default UsuariosAdmin;