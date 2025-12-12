# api/services/tse_service.py
"""Servicio para consultar cédulas en el TSE de Costa Rica
mediante web scraping al sitio público.b"""
import requests
from bs4 import BeautifulSoup
import re


class TSEService:
    """Servicio para consultar datos de cédulas en el TSE de Costa Rica."""
    
    URL = "https://servicioselectorales.tse.go.cr/chc/consulta_cedula.aspx"
    
    def __init__(self):
        self.session = requests.Session()
        # Headers para simular un navegador
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-CR,es;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
    
    def _limpiar_cedula(self, cedula: str) -> str:
        """Elimina guiones y espacios de la cédula."""
        return re.sub(r'[\s\-]', '', cedula)
    
    def _extraer_campos_aspnet(self, soup: BeautifulSoup) -> dict:
        """Extrae los campos hidden de ASP.NET necesarios para el POST."""
        campos = {}
        for field_name in ['__VIEWSTATE', '__VIEWSTATEGENERATOR', '__EVENTVALIDATION']:
            field = soup.find('input', {'name': field_name})
            if field:
                campos[field_name] = field.get('value', '')
        return campos
    
    def _parsear_fecha(self, fecha_str: str) -> str:
        """Convierte fecha DD/MM/YYYY a YYYY-MM-DD (formato ISO)."""
        try:
            partes = fecha_str.strip().split('/')
            if len(partes) == 3:
                return f"{partes[2]}-{partes[1]}-{partes[0]}"
        except:
            pass
        return None
    
    def _extraer_edad(self, edad_str: str) -> int:
        """Extrae el número de la cadena de edad (ej: '81 AÑOS' -> 81)."""
        try:
            match = re.search(r'(\d+)', edad_str)
            if match:
                return int(match.group(1))
        except:
            pass
        return None
    
    def consultar_cedula(self, cedula: str) -> dict:
        """
        Consulta una cédula en el TSE y devuelve los datos de la persona.
        
        Args:
            cedula: Número de cédula (puede incluir guiones o no)
            
        Returns:
            dict con los datos de la persona o error
        """
        cedula_limpia = self._limpiar_cedula(cedula)
        
        # Validación básica de formato
        if not cedula_limpia.isdigit() or len(cedula_limpia) < 9:
            return {
                'valida': False,
                'error': 'Formato de cédula inválido. Debe tener al menos 9 dígitos.'
            }
        
        try:
            # Paso 1: GET inicial para obtener campos ASP.NET y cookies
            response = self.session.get(self.URL, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            campos_aspnet = self._extraer_campos_aspnet(soup)
            
            # Verificar que tenemos los campos necesarios
            if not campos_aspnet.get('__VIEWSTATE'):
                return {
                    'valida': False,
                    'error': 'No se pudo obtener el estado de la página del TSE'
                }
            
            # Paso 2: POST con la cédula
            # Buscamos el ID del textbox de cédula
            textbox = soup.find('input', {'type': 'text'})
            textbox_name = textbox.get('name', 'txtcedula') if textbox else 'txtcedula'
            
            # Buscamos el botón de consulta
            button = soup.find('input', {'type': 'submit'})
            button_name = button.get('name', 'btnConsultaCedula') if button else 'btnConsultaCedula'
            
            data = {
                **campos_aspnet,
                textbox_name: cedula_limpia,
                button_name: 'Consultar'
            }
            
            response = self.session.post(self.URL, data=data, timeout=15)
            response.raise_for_status()
            
            # Paso 3: Parsear la respuesta
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Buscar tabla de resultados o mensaje de error
            # Basado en la captura del usuario, los datos están en una tabla
            resultado = self._parsear_resultado(soup, cedula_limpia)
            
            return resultado
            
        except requests.Timeout:
            return {
                'valida': False,
                'error': 'El servidor del TSE no respondió a tiempo. Intente de nuevo.'
            }
        except requests.RequestException as e:
            return {
                'valida': False,
                'error': f'Error de conexión con el TSE: {str(e)}'
            }
        except Exception as e:
            return {
                'valida': False,
                'error': f'Error inesperado: {str(e)}'
            }
    
    def _parsear_resultado(self, soup: BeautifulSoup, cedula: str) -> dict:
        """Parsea la página de resultados del TSE."""
        
        # Buscar si hay mensaje de error (cédula no encontrada)
        error_msgs = ['no se encontró', 'no encontrada', 'no existe']
        page_text = soup.get_text().lower()
        
        for msg in error_msgs:
            if msg in page_text:
                return {
                    'valida': False,
                    'error': 'Cédula no encontrada en el padrón electoral'
                }
        
        # Intentar extraer datos de la tabla de resultados
        # Basándonos en la estructura vista en la captura
        resultado = {
            'valida': True,
            'cedula': cedula,
            'nombre_completo': None,
            'fecha_nacimiento': None,
            'nacionalidad': None,
            'edad': None
        }
        
        # Buscar por texto de las etiquetas
        # El TSE usa una estructura de tabla con labels y valores
        
        # Método 1: Buscar por texto de label
        for td in soup.find_all('td'):
            text = td.get_text(strip=True)
            next_td = td.find_next_sibling('td')
            
            if next_td:
                value = next_td.get_text(strip=True)
                
                if 'Nombre Completo' in text:
                    resultado['nombre_completo'] = value
                elif 'Fecha Nacimiento' in text or 'Fecha de Nacimiento' in text:
                    resultado['fecha_nacimiento'] = self._parsear_fecha(value)
                    resultado['fecha_nacimiento_display'] = value  # Mantener original
                elif 'Nacionalidad' in text:
                    resultado['nacionalidad'] = value
                elif text == 'Edad' or 'Edad :' in text:
                    resultado['edad'] = self._extraer_edad(value)
        
        # Método 2: Buscar spans con IDs específicos (común en ASP.NET)
        if not resultado['nombre_completo']:
            for span in soup.find_all('span'):
                span_id = span.get('id', '').lower()
                text = span.get_text(strip=True)
                
                if 'nombre' in span_id and text:
                    resultado['nombre_completo'] = text
                elif 'fecha' in span_id and 'nacimiento' in span_id and text:
                    resultado['fecha_nacimiento'] = self._parsear_fecha(text)
                elif 'nacionalidad' in span_id and text:
                    resultado['nacionalidad'] = text
        
        # Si encontramos el nombre, consideramos la consulta exitosa
        if resultado['nombre_completo']:
            # Separar nombre y apellidos (el formato es: NOMBRE APELLIDO1 APELLIDO2)
            partes = resultado['nombre_completo'].split()
            if len(partes) >= 3:
                # Asumimos: último es segundo apellido, penúltimo es primer apellido, resto es nombre
                resultado['primer_apellido'] = partes[-2]
                resultado['segundo_apellido'] = partes[-1]
                resultado['nombre'] = ' '.join(partes[:-2])
            elif len(partes) == 2:
                resultado['nombre'] = partes[0]
                resultado['primer_apellido'] = partes[1]
                resultado['segundo_apellido'] = ''
            else:
                resultado['nombre'] = resultado['nombre_completo']
                resultado['primer_apellido'] = ''
                resultado['segundo_apellido'] = ''
            
            return resultado
        else:
            return {
                'valida': False,
                'error': 'No se pudieron extraer los datos. La estructura de la página pudo haber cambiado.'
            }

# Instancia singleton
tse_service = TSEService()