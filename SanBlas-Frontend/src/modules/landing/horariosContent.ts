export type HorarioFila = {
  dia: string;
  horas: string[];
};

export type HorarioBloque = {
  titulo: string;
  filas: HorarioFila[];
};

// valores del volante de la Santa Misa (respaldo si el backend no responde y base del editor)
export const HORARIOS_DEFAULT = {
  title: "Horarios",
  subtitle: "de la Santa",
  titleHighlight: "Misa",
  intro:
    "Horarios de misas de la Parroquia San Blas de Nicoya, Guanacaste. Consulte celebraciones entre semana y misas dominicales.",
  imageUrl: "",
  bloques: [
    {
      titulo: "Entre semana",
      filas: [
        { dia: "Lunes - Martes - Miércoles", horas: ["05:00 PM"] },
        {
          dia: "Jueves",
          horas: ["Adoración: 04:00 PM", "Santa Misa: 05:00 PM"],
        },
        { dia: "Viernes", horas: ["05:00 PM"] },
        { dia: "Sábado", horas: ["05:00 PM"] },
      ],
    },
    {
      titulo: "Misa dominical",
      filas: [
        {
          dia: "Domingo",
          horas: ["07:00 AM", "08:00 AM", "10:30 AM", "05:00 PM"],
        },
      ],
    },
  ] as HorarioBloque[],
};