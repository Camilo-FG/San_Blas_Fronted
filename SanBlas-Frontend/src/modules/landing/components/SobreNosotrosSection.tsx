import "./SobreNosotrosSection.css";

import sobreNosotrosImage from "../../../assets/interior-iglesia-colonial-nicoya.jpg";

const destacadosIzquierda = [
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
];

const destacadosDerecha = [
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
];

function SobreNosotrosSection() {
  return (
    <section className="sobre-nosotros" id="sobre-nosotros">
      <div className="sobre-nosotros__container">
        <div className="sobre-nosotros__header">
          <span className="sobre-nosotros__eyebrow">Sobre Nosotros</span>
          <h2 className="sobre-nosotros__title">
            Una parroquia que guarda la fe, la historia y la cercanía de Nicoya
          </h2>
          <p className="sobre-nosotros__lead">
            La Parroquia San Blas de Nicoya es un referente espiritual y
            cultural de Costa Rica. Su historia, su misión pastoral y su
            vocación de servicio siguen acompañando a una comunidad viva,
            hospitalaria y profundamente creyente.
          </p>
        </div>

        <div className="sobre-nosotros__grid">
          <div className="sobre-nosotros__column sobre-nosotros__column--left">
            {destacadosIzquierda.map((destacado) => (
              <article
                className="sobre-nosotros__card"
                key={destacado.titulo}
              >
                <div className="sobre-nosotros__card-icon">{destacado.icono}</div>
                <h3 className="sobre-nosotros__card-title">{destacado.titulo}</h3>
                <p className="sobre-nosotros__card-text">{destacado.texto}</p>
              </article>
            ))}
          </div>

          <div className="sobre-nosotros__visual">
            <div className="sobre-nosotros__image-frame">
              <img
                src={sobreNosotrosImage}
                alt="Vista central de la Parroquia San Blas de Nicoya"
                className="sobre-nosotros__image"
              />
            </div>
          </div>

          <div className="sobre-nosotros__column sobre-nosotros__column--right">
            {destacadosDerecha.map((destacado) => (
              <article
                className="sobre-nosotros__card"
                key={destacado.titulo}
              >
                <div className="sobre-nosotros__card-icon">{destacado.icono}</div>
                <h3 className="sobre-nosotros__card-title">{destacado.titulo}</h3>
                <p className="sobre-nosotros__card-text">{destacado.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SobreNosotrosSection;