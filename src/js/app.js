let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function(){
    iniciarApp();
});

function iniciarApp() {
    mostrarServicios();

    /* resalta el div actual segun el tab*/
    mostrarSeccion();


    /* oculta o muestra la seccion segun el tab */
    cambiarSeccion();

    /* paginacion siguiente y anterior */ 
    paginaSiguiente();
    paginaAnterior();

    /* comprueba la pagina actual para ocultar o mostrar paginacion */
    botonesPaginador();

    /* mostrar resumen de la cita  o mensaje de error */
    mostrarResumen();

    /* guardar nombre cita */
    nombreCita();

    /* almacena fecha de la cita */
    fechaCita();

    /* almacena la hora de la cita */
    horaCita();

    /* deshabilita dias pasados */
    deshabilitarFechaAnterior();

}
function mostrarSeccion(){
    /* eliminar mostrar-seccion de la seccion anterior */
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar-seccion');
    }
    

    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');

    /* eliminar clase de actual en el tab anterior */
    const tabsAnterior = document.querySelector('.tabs .actual');
    if(tabsAnterior){
        tabsAnterior.classList.remove('actual'); 
    }   

    /* resalta el tab actual */
    const tabs = document.querySelector(`[data-paso="${pagina}"]`);
    tabs.classList.add('actual');
}

function cambiarSeccion(){
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach(enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);


            //mandamos a llamar la funcion mostrarSeccion. de esta manera tambien podemos paginar desde los tabs y no solo desde el paginador
            mostrarSeccion();

            botonesPaginador();
        });
    });
}

async function mostrarServicios(){
    try { 
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();
        const { servicios } = db;

       /* generar HTML */

       servicios.forEach( servicio => {
           const {id, nombre, precio } = servicio;

           /* DOM Scripting */
           /* nombre del servicio */
           const nombreServicio = document.createElement('P');
           nombreServicio.textContent = nombre; 
           nombreServicio.classList.add('nombre-servicio');

           /* precio del servicio */
           const precioServicio = document.createElement('P');
           precioServicio.textContent = `$ ${precio}`
           precioServicio.classList.add('precio-servicio');
           

            /* div contenedor */
            const servicioDiv = document.createElement('div');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            /* selecciona un servicio y cambia el color del background */
            servicioDiv.onclick = seleccionarServicio;


            /* insertar precio y nombre */
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            /* inyectar en HTML */
            document.querySelector('#servicios').appendChild(servicioDiv);
       })
    } catch (error) {
        console.log(error);
    }
}

function seleccionarServicio(e) {
    
    let elemento;
    /* forzar que el elemento al cual se le de click sea el Div */
    if(e.target.tagName === 'P') {
        /* de esta manera forzamos a ir al elemento div. ya sea haciendo click en el parrafo y redirigiendo al padre(div) */
        elemento = e.target.parentElement;  
    } else {
        /* o directamente haciendo click en el div */
        elemento = e.target;
    }
     
     if(elemento.classList.contains('seleccionado')){
         elemento.classList.remove('seleccionado');

         const id = parseInt( elemento.dataset.idServicio );
         

         eliminarServicio(id);
     } else {
         elemento.classList.add('seleccionado');

         const servicioObj = {
             id: parseInt ( elemento.dataset.idServicio),
             nombre: elemento.firstElementChild.textContent,
             precio: elemento.firstElementChild.nextElementSibling.textContent
         }
         /* console.log(servicioObj); */
         agregarServicio(servicioObj);
     }
}

function eliminarServicio(id){
    const { servicios } = cita;
    cita.servicios = servicios.filter( servicio => servicio.id !== id );

    /* console.log(cita); */
}

function agregarServicio(servicioObj){
    const { servicios } = cita;
    cita.servicios = [...servicios, servicioObj];
    /* console.log(cita); */
    
}

function paginaSiguiente(){
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;
        //console.log(pagina);
        /* mandamos a llamar  nuevamente la funcion para que corrobore en que pag estamos*/
        botonesPaginador();
    });
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', ()=>{
        pagina--;
        //console.log(pagina);
        botonesPaginador();
    });
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if(pagina === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if(pagina === 3) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        mostrarResumen();//vovlemos a llamar la funcion de resument ya que nos encontramos en la pag 3
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion(); //para mostrar la seccion siguiente
}

function mostrarResumen() {
    //Destructuring y validacion de objeto
    const { nombre, fecha, hora, servicios } = cita;

    // seleccionar el resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    //limpiar el HTML
    //resumenDiv.innerHTML = ''; no se debe realizar de esta manera

    while(resumenDiv.firstChild){
        resumenDiv.removeChild( resumenDiv.firstChild);    
    }

    //validacion de objeto
    if(Object.values(cita).includes('')) {
        /* console.log('No hay datos'); */
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de Servicios, Hora, Nombre o Fecha';
        noServicios.classList.add('invalidar-cita');

        //agregar a resumenDiv
        resumenDiv.appendChild(noServicios);
        return; //podemos colocar directamente este codigo en vez de el else
    } 

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';

    //mostrar resumen
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre: </span> ${nombre}`;

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha: </span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora: </span> ${hora}`;

    const serviciosCitas = document.createElement('DIV');
    serviciosCitas.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';

    serviciosCitas.appendChild(headingServicios);

    let cantidad = 0;
    //iterar sobre el arreglo de servicios

    servicios.forEach( servicio =>{
        const { nombre, precio } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');


        const totalServicio = precio.split('$');//debemos sacar el signo $
        cantidad += parseInt(totalServicio[1].trim());

        //console.log(textoServicio);

        //colocar en el div
        contenedorServicio.appendChild(textoServicio);        
        contenedorServicio.appendChild(precioServicio); 
        
        serviciosCitas.appendChild(contenedorServicio);

    });

    /* console.log(cantidad); */

    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);
    resumenDiv.appendChild(serviciosCitas);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a Pagar: </span> $ ${cantidad}`;

    resumenDiv.appendChild(cantidadPagar);
}

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', (e) => {
        const nombreTexto = e.target.value.trim();
        /* console.log(nombreTexto); */
        //validacion nombre
        if(nombreTexto === ''|| nombreTexto.length < 3){
            mostrarAlerta('nombre no valido', 'error');
            
        } else {
            const alerta = document.querySelector('.alerta');
            if(alerta){
                alerta.remove();
            }
            cita.nombre = nombreTexto;
            //console.log(cita);
        } 
    })
}
function mostrarAlerta(mensaje, tipo){
    
    //si hay una alerta previa no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia){
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo === 'error'){
        alerta.classList.add('error');
    }
    
    //insertar en el HTML
    const formulario = document.querySelector('.formulario');
    formulario.appendChild( alerta );

    //eliminar alerta luego de un tiempo
    setTimeout(()=>{
        alerta.remove();
    },3000);
    
}

function fechaCita(){
    const fechaInput = document.querySelector('#date');
    fechaInput.addEventListener('input', e => {
        /* console.log(e.target.value); */

        /* mostrar alerta que no es valido el dia que no se prestan servicios */
        const dia = new Date(e.target.value).getUTCDay();

        if([0, 6].includes(dia)){
            e.preventDefault();
            fechaInput.value = '';
            mostrarAlerta('Fines de semana no son permitodos', 'error');
        } else {
            cita.fecha = fechaInput.value;

            /* console.log(cita); */
        }

        //las opciones que tiene la fecha es poder acceder solo al día
        /* const opciones = {
            weekday: 'long', 
            year:'numeric', 
            month:'long'
        } */
        //toLocalDateString nos permite cambiar el idioma en que nos entrega la informacion 
        /* console.log(dia.toLocaleDateString('es-ES', opciones)); */
    })
}

function deshabilitarFechaAnterior() {
    const inputFecha = document.querySelector('#date');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const month = fechaAhora.getMonth() + 1;
    const day = fechaAhora.getDate() + 1;//de esta manera evitamos que reserven el mismo día
    //formato deseado: AAAA-MM-DD
    const fechaDeshabilitar = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`

    inputFecha.min = fechaDeshabilitar;
}

function horaCita(){
    const horaInput = document.querySelector('#hora');
    horaInput.addEventListener('input', e =>{

        const horaCita = e.target.value;
        const hora = horaCita.split(':'); //de esta manera transformamos horaCita en un array con dos posiciones

        if(hora[0] < 10 || hora[0] > 18){
            mostrarAlerta('Hora no valida', 'error');
            setTimeout(() =>{
                horaInput.value = '';
            }, 3000);
        } else {
            cita.hora = horaCita;
            /* console.log(cita); */
        }
        
    });
}