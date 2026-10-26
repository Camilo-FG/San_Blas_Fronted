export const CONDICIONES_BAUTISMO = [
  "padre_madre", "padrino_madrina", "formacion_catequetica",
] as const;

export type CondicionBautismo = (typeof CONDICIONES_BAUTISMO)[number];

export const ETIQUETA_CONDICION: Record<CondicionBautismo, string> = {
  padre_madre: "Padre/Madre",
  padrino_madrina: "Padrino/Madrina",
  formacion_catequetica: "Formación catequética",
};

export const AYUDA_CONDICION_BAUTISMO: Record<CondicionBautismo, string> = {
  padre_madre: "Esta inscripción es para la preparación como padre o madre para el bautismo de su hijo/a.",
  padrino_madrina: "Como orientación general, el padrino o la madrina debe ser católico/a, haber recibido la Confirmación y la Eucaristía, llevar una vida acorde con la fe y tener al menos 16 años, salvo las excepciones previstas. No puede ser el padre ni la madre de quien se bautiza. La parroquia revisará los requisitos aplicables; completar la catequesis no sustituye esa revisión.",
  formacion_catequetica: "Esta opción es para participar por formación personal en la fe; no indica que se inscriba como padre, madre, padrino o madrina.",
};
