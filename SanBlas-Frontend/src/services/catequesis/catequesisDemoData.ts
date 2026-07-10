import type { CatequesisEnrollmentRecord } from "../../modules/dashboard/catequesis/Types/catequesis";

const buildDemoRecord = (
  id: number,
  nombre: string,
  apellidos: string,
  filial: string,
  nivel: string,
  telefono: string,
  diasAtras: number,
): CatequesisEnrollmentRecord => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);

  return {
    id,
    codigoSolicitud: `CAT-${id}`,
    estado: id === 2 ? "aprobado" : "pendiente",
    fechaSolicitud: fecha.toISOString().split("T")[0],
    catequesis: {
      centroCatequesis: filial,
      nivelAInscribirse: nivel,
      feBautismoArchivo: "fe-bautismo-demo.pdf",
    },
    catequizando: {
      nombre,
      apellidos,
      fechaNacimiento: "2016-05-12",
      direccion: { direccionExacta: "Nicoya, Guanacaste" },
      bautismo: {
        parroquia: "Parroquia San Blas",
        fecha: "2016-06-20",
        tomo: "12",
        folio: "45",
        asiento: "18",
      },
      adecuacion: {
        requiereAdecuacionCentroEducativo: false,
        descripcionAdecuacion: null,
      },
      condicionSalud: {
        portadorEnfermedadCronica: false,
        descripcionEnfermedad: null,
      },
    },
    encargado: {
      nombre: "Ana",
      apellidos: "López Mora",
      cedula: "",
      telefono,
      correo: "",
      direccion: { direccionExacta: "Nicoya, Guanacaste" },
      parentesco: "Madre",
    },
    pago: {
      metodoPago: "SINPE Móvil",
      numeroComprobante: "DEMO-0001",
      monto: 5000,
      comprobanteArchivo: "comprobante-demo.pdf",
    },
  };
};

export const DEMO_CATEQUESIS_RECORDS: CatequesisEnrollmentRecord[] = [
  buildDemoRecord(
    1,
    "María",
    "Rodríguez López",
    "Curime",
    "Primero",
    "+506 8888-0000",
    2,
  ),
  buildDemoRecord(
    2,
    "José",
    "Vargas Mena",
    "Casitas",
    "Sétimo",
    "+506 8777-1111",
    5,
  ),
  buildDemoRecord(
    3,
    "Sofía",
    "Alfaro Ruiz",
    "Piedra Blanca",
    "Primero",
    "+506 8666-2222",
    1,
  ),
];
