"""
Servicio de integración con Brevo para envío de emails transaccionales.
Incluye funcionalidades para:
- Envío de códigos de verificación de email
- Envío de notificaciones de eventos
"""
import os
import random
import string
from datetime import datetime, timedelta

# Importar SDK de Brevo (sib_api_v3_sdk) - IMPORTANTE: Instalar con pip install sib-api-v3-sdk
try:
    import sib_api_v3_sdk
    from sib_api_v3_sdk.rest import ApiException
    BREVO_AVAILABLE = True
except ImportError:
    BREVO_AVAILABLE = False
    print("sib_api_v3_sdk no está instalado. Ejecute: pip install sib-api-v3-sdk")


class BrevoService:
    """
    Servicio para enviar emails usando la API de Brevo (anteriormente SendinBlue).
    """
    
    def __init__(self):
        self.api_key = os.environ.get('BREVO_API_KEY', '')
        self.sender_email = os.environ.get('BREVO_SENDER_EMAIL', 'noreply@puntarenassemueve.com')
        self.sender_name = os.environ.get('BREVO_SENDER_NAME', 'Puntarenas Se Mueve')
        self.verification_expiry_minutes = 15  # Expiración del código: 15 minutos
        
        if BREVO_AVAILABLE and self.api_key:
            configuration = sib_api_v3_sdk.Configuration()
            configuration.api_key['api-key'] = self.api_key
            self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
                sib_api_v3_sdk.ApiClient(configuration)
            )
        else:
            self.api_instance = None
    
    def generar_codigo_verificacion(self, longitud=6):
        """Genera un código de verificación numérico aleatorio."""
        return ''.join(random.choices(string.digits, k=longitud))
    
    def enviar_codigo_verificacion(self, email, codigo):
        """
        Envía un email con el código de verificación.
        
        Args:
            email: Dirección de correo del destinatario
            codigo: Código de verificación a enviar
            
        Returns:
            dict con 'success' y 'message' o 'error'
        """
        if not BREVO_AVAILABLE:
            return {
                'success': False,
                'error': 'El SDK de Brevo no está disponible. Instale: pip install sib-api-v3-sdk'
            }
        
        if not self.api_key:
            return {
                'success': False,
                'error': 'BREVO_API_KEY no está configurada en las variables de entorno'
            }
        
        try:
            # Crear contenido del email
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }}
                    .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
                    .header {{ text-align: center; margin-bottom: 25px; }}
                    .header h1 {{ color: #2563eb; margin: 0; font-size: 24px; }}
                    .code-box {{ background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-size: 32px; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; font-weight: bold; }}
                    .message {{ color: #64748b; line-height: 1.6; text-align: center; }}
                    .footer {{ text-align: center; margin-top: 25px; font-size: 12px; color: #94a3b8; }}
                    .warning {{ color: #f59e0b; font-weight: 500; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Puntarenas Se Mueve</h1>
                    </div>
                    <p class="message">Tu código de verificación es:</p>
                    <div class="code-box">{codigo}</div>
                    <p class="message">
                        Ingresa este código en la aplicación para verificar tu correo electrónico.
                    </p>
                    <p class="message warning">
                        Este código expira en {self.verification_expiry_minutes} minutos.
                    </p>
                    <div class="footer">
                        <p>Si no solicitaste este código, ignora este mensaje.</p>
                        <p>© {datetime.now().year} Puntarenas Se Mueve - Municipalidad de Puntarenas</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Configurar el email
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": email}],
                sender={"name": self.sender_name, "email": self.sender_email},
                subject="Código de verificación - Puntarenas Se Mueve",
                html_content=html_content
            )
            
            # Enviar email
            response = self.api_instance.send_transac_email(send_smtp_email)
            
            return {
                'success': True,
                'message': f'Código enviado a {email}',
                'message_id': response.message_id
            }
            
        except ApiException as e:
            print(f"Error enviando email con Brevo: {e}")
            return {
                'success': False,
                'error': f'Error al enviar email: {str(e)}'
            }
        except Exception as e:
            print(f"Error inesperado: {e}")
            return {
                'success': False,
                'error': f'Error inesperado: {str(e)}'
            }
    
    def enviar_recordatorio_evento(self, email, nombre_usuario, evento_nombre, evento_fecha, 
                                    evento_hora, evento_ubicacion, dias_anticipacion):
        """
        Envía un email recordando al usuario sobre un evento próximo.
        
        Args:
            email: Email del destinatario
            nombre_usuario: Nombre del usuario
            evento_nombre: Nombre del evento
            evento_fecha: Fecha del evento
            evento_hora: Hora del evento
            evento_ubicacion: Ubicación del evento
            dias_anticipacion: Días faltantes para el evento
        
        Returns:
            dict con 'success' y 'message' o 'error'
        """
        if not BREVO_AVAILABLE or not self.api_key:
            return {'success': False, 'error': 'Brevo no está configurado'}
        
        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }}
                    .container {{ max-width: 550px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
                    .header {{ text-align: center; margin-bottom: 25px; }}
                    .header h1 {{ color: #2563eb; margin: 0; font-size: 24px; }}
                    .event-card {{ background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                    .event-name {{ font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }}
                    .event-detail {{ color: #475569; margin: 8px 0; display: flex; align-items: center; gap: 8px; }}
                    .countdown {{ text-align: center; background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                    .countdown-number {{ font-size: 36px; font-weight: bold; color: #d97706; }}
                    .footer {{ text-align: center; margin-top: 25px; font-size: 12px; color: #94a3b8; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1> Puntarenas Se Mueve</h1>
                    </div>
                    
                    <p>Hola <strong>{nombre_usuario}</strong>,</p>
                    <p>Te recordamos que tienes un evento próximo:</p>
                    
                    <div class="event-card">
                        <div class="event-name"> {evento_nombre}</div>
                        <div class="event-detail"> Fecha: <strong>{evento_fecha}</strong></div>
                        <div class="event-detail"> Hora: <strong>{evento_hora}</strong></div>
                        <div class="event-detail"> Lugar: <strong>{evento_ubicacion}</strong></div>
                    </div>
                    
                    <div class="countdown">
                        <div class="countdown-number">{dias_anticipacion}</div>
                        <div>{"día" if dias_anticipacion == 1 else "días"} para el evento</div>
                    </div>
                    
                    <p style="text-align: center; color: #64748b;">
                        ¡No olvides asistir! Te esperamos.
                    </p>
                    
                    <div class="footer">
                        <p>Para modificar tus preferencias de notificación, visita tu perfil.</p>
                        <p>© {datetime.now().year} Puntarenas Se Mueve</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": email}],
                sender={"name": self.sender_name, "email": self.sender_email},
                subject=f"Recordatorio: {evento_nombre} en {dias_anticipacion} {'día' if dias_anticipacion == 1 else 'días'}",
                html_content=html_content
            )
            
            response = self.api_instance.send_transac_email(send_smtp_email)
            
            return {
                'success': True,
                'message': f'Recordatorio enviado a {email}',
                'message_id': response.message_id
            }
            
        except ApiException as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            return {'success': False, 'error': str(e)}


# Instancia singleton del servicio
brevo_service = BrevoService()