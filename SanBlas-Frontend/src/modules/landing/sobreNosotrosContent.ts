export type SobreNosotrosCard = {
  icono: string;
  titulo: string;
  texto: string;
};

export const SOBRE_NOSOTROS_IMAGE = "/sobre-nosotros.jpg";

export const SOBRE_NOSOTROS_DEFAULT = {
  eyebrow: "Sobre Nosotros",
  title: "Una parroquia que guarda la fe, la historia y la cercanía de Nicoya",
  lead:
    "La Parroquia San Blas de Nicoya es un referente espiritual y cultural de Costa Rica. Su historia, su misión pastoral y su vocación de servicio siguen acompañando a una comunidad viva, hospitalaria y profundamente creyente.",
  imageUrl: "",
  cards: [
    {
      icono: "01",
      titulo: "Raíz histórica",
      texto:
        "La Parroquia San Blas ha acompañado la vida espiritual de Nicoya desde sus orígenes, siendo parte esencial de la memoria religiosa y cultural de Costa Rica.",
    },
    {
      icono: "02",
      titulo: "Identidad cultural",
      texto:
        "Su presencia ha contribuido a preservar tradiciones, celebraciones y expresiones de fe que fortalecen el sentido de pertenencia de la comunidad nicoyana.",
    },
    {
      icono: "03",
      titulo: "Misión espiritual",
      texto:
        "Nuestra misión es anunciar el Evangelio, celebrar los sacramentos y sostener la fe del pueblo con una pastoral cercana, serena y comprometida.",
    },
    {
      icono: "04",
      titulo: "Servicio a la comunidad",
      texto:
        "Acompañamos a niños, jóvenes, adultos mayores y familias con catequesis, formación y espacios de servicio que buscan unir fe y vida diaria.",
    },
  ] as SobreNosotrosCard[],
};
