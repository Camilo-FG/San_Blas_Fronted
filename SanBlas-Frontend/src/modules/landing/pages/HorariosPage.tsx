import { useLandingSection } from "../../../hooks/useLandingSection";

type HorarioBloque = {
  titulo: string;
  items: string[];
};

const HORARIOS_DEFAULT = {
  title: "Horarios Parroquiales",
  intro:
    "Consulte nuestros horarios de misas, confesiones y atención en la Oficina Parroquial San Blas.",
  bloques: [
    {
      titulo: "Horario de Misas (Entre Semana)",
      items: ["Lunes a Jueves: 6:00 p.m.", "Viernes: 6:00 p.m."],
    },
    {
      titulo: "Horario de Misas (Fines de Semana)",
      items: ["Sábados: 4:00 p.m. y 6:00 p.m.", "Domingos: 7:00 a.m. - 9:00 a.m. - 4:00 p.m. - 6:00 p.m."],
    },
    {
      titulo: "Horarios de Confesiones",
      items: [
        "Jueves: Durante la Hora Santa (Después de la misa de 6:00 p.m.).",
        "Viernes: 4:00 p.m. a 5:30 p.m.",
      ],
    },
    {
      titulo: "Atención en Oficina Parroquial",
      items: [
        "Lunes a Viernes: 8:00 a.m. a 12:00 m.d. y 1:30 p.m. a 5:00 p.m.",
        "Sábados: 8:00 a.m. a 12:00 m.d. (Cerrado por la tarde).",
      ],
    },
  ] as HorarioBloque[],
};

function HorariosPage() {
  const { data } = useLandingSection("horarios", HORARIOS_DEFAULT);
  const bloques = data.bloques ?? HORARIOS_DEFAULT.bloques;

  return (
    <div className="horarios-page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "20px" }}>{data.title}</h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "30px" }}>
        {data.intro}
      </p>

      <div style={{ textAlign: "left", marginTop: "20px", backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
        {bloques.map((bloque, index) => (
          <div key={bloque.titulo} style={{ marginTop: index === 0 ? 0 : "20px" }}>
            <h2 style={{ color: "#2980b9" }}>{bloque.titulo}</h2>
            <ul style={{ lineHeight: "1.8" }}>
              {bloque.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HorariosPage;
