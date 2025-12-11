import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Search, User, Shield, ShieldAlert, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import UserService from '../../services/userService';
import AuthService from '../../services/authService';
import UserGroupService from '../../services/userGroupService';

function UsuariosAdmin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
        edad: '',
        fecha_nacimiento: '',
        role: 'user' // 'user' or 'admin'
    });

    useEffect(() => {
        obtenerUsuarios();
    }, []);

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

    const [editingId, setEditingId] = useState(null);

    // ... (useEffect remains same)

    // ... (obtenerUsuarios remains same)

    const manejarCambioInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            password: '', // No cargar password, de esta manera se mantiene la contraseña actual
            nombre: user.first_name || '',
            apellido: user.last_name || '',
            telefono: user.telefono || '',
            edad: user.edad || '',
            fecha_nacimiento: user.fecha_nacimiento || '',
            role: user.is_staff ? 'admin' : 'user' // Asumiendo que is_staff determina admin por ahora, o verificar lógica de roles
        });
        setIsDialogOpen(true);
    };

    const limpiarFormulario = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            nombre: '',
            apellido: '',
            telefono: '',
            edad: '',
            fecha_nacimiento: '',
            role: 'user'
        });
        setEditingId(null);
        setIsDialogOpen(false);
    };

    const validarRegistro = () => {
        // Campos obligatorios basicos
        if (!formData.username || !formData.email || !formData.nombre || !formData.apellido) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: "Por favor complete todos los campos obligatorios.",
            });
            return false;
        }
        
        // Validar password solo si es creacion o si se escribio algo (cambio de pass)
        if ((!editingId || formData.password) && formData.password.length < 6) {
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
                    last_name: formData.apellido,
                    telefono: formData.telefono,
                    edad: formData.edad,
                    fecha_nacimiento: formData.fecha_nacimiento,
                    //El backend debe soportar el manejo de roles
                };
                
                // Solo enviar password si se cambio
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await UserService.updateUser(editingId, updateData);
                
                // Actualizar rol si hubo un cambio
                // Nota: Esto depende de cómo el backend maneje roles. Si es por UserGroup, llamamos al servicio.
                if (formData.role === 'admin') {
                     await UserGroupService.asignarRole(editingId, 1);
                } else {
                     await UserGroupService.asignarRole(editingId, 0); // 0 cliente
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
                    formData.apellido,
                    formData.email,
                    formData.password,
                    formData.telefono,
                    formData.edad,
                    formData.fecha_nacimiento
                );

                // Asignar el rol si es admin
                if (formData.role === 'admin') {
                    const userId = newUser.id || (newUser.user && newUser.user.id);
                    if (userId) {
                        await UserGroupService.asignarRole(userId, 1);
                    }
                }

                toast({
                    title: "Éxito",
                    description: "Usuario creado correctamente.",
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    </DialogTrigger>
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
                                    <Label htmlFor="username">Nombre de Usuario *</Label>
                                    <Input id="username" name="username" value={formData.username} onChange={manejarCambioInput} placeholder="jdoe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico *</Label>
                                    <Input id="email" name="email" type="email" value={formData.email} onChange={manejarCambioInput} placeholder="jdoe@example.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input id="nombre" name="nombre" value={formData.nombre} onChange={manejarCambioInput} placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido *</Label>
                                    <Input id="apellido" name="apellido" value={formData.apellido} onChange={manejarCambioInput} placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña {editingId ? '(Opcional)' : '*'}</Label>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    value={formData.password} 
                                    onChange={manejarCambioInput} 
                                    placeholder={editingId ? "Dejar en blanco para mantener actual" : ""}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input id="telefono" name="telefono" value={formData.telefono} onChange={manejarCambioInput} placeholder="88888888" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edad">Edad</Label>
                                    <Input id="edad" name="edad" type="number" value={formData.edad} onChange={manejarCambioInput} placeholder="25" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={manejarCambioInput} />
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
            </div>

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
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
                                        <TableCell>{`${user.first_name || ''} ${user.last_name || ''}`}</TableCell>
                                        <TableCell>{user.telefono || '-'}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => iniciarEdicion(user)}>
                                                Editar
                                            </Button>
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