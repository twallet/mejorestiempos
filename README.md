# Automatizaciones Programa Mejores Tiempos  
Automatización del diagnostico inicial del [Programa Mejores Tiempos](https://nextstepslab.com/mejorestiempos) y del monitoreo de avances de participantes compartido con clientes.  
El Programa Mejores Tiempos es un programa de capacitación para personas y empresas en las herramientas clave para una gestión consciente y productiva del tiempo. Más de 2.600 personas ya participaron de la experiencia, tanto en formato individual como grupal, y múltiples empresas lo han incorporado a sus planes de capacitación para aumentar la productividad y bienestar de sus equipos.  

## Automatización Radar del Tiempo  
El programa empieza con un autodiagnostico _**(Google Form),**_ llamado _Radar del Tiempo_. Automaticé con _**Google App Script**_ la generación y el envío del radar por email. Se valida a través de la _**API de Teachable**_ (sobre la cual está montada la plataforma Next Steps Lab) que la persona esté registrada en la plataforma. 

![Radar del Tiempo](/images/RadarDelTiempo.png)  
⌨️ [Código](https://github.com/twallet/mejorestiempos/tree/main/radar) | ⌛ [Probarlo](https://forms.gle/LTG37hsMRkFhptKj6)

---

## Automatización Avances
Al manejar una gran cantidad de personas (picos de 150 personas haciendo el programa a la vez, 2.600 participantes en total), tuvé que automatizar varias tareas con _**Google App Script, API y Webhooks de Teachable**_:  
- Actualizar un dashboard de monitoreo para seguir indicadores y detectar eventuales problemas técnicos.  
![Dashboard](/images/DashboardMT.jpg)
  
- Enviar un email diario de resumen de indicadores.
- Recopilación periódica de comentarios en los foros para poder responder rápidamente (picos de 80 comentarios por día).
- Emails personalizados con datos del Radar del Tiempo de la persona para "recuperarla" cuando pasan varias semanas sin entrar a la plataforma.
- Actualización en tiempo real de planilla de avances por cliente.  
![SeguimientoCliente](/images/SeguimientoCliente.jpg)
  
⌨️ [Código](https://github.com/twallet/mejorestiempos/tree/main/radar) 
