import {
  CATEQUESIS_INTRO,
  CATEQUESIS_NIVELES_INFANTILES,
  CATEQUESIS_NIVELES_JUVENILES,
} from "../constants/catequesisInformacion";
import "./CatequesisInfoSection.css";

const CatequesisInfoSection = () => (
  <section className="catequesis-info" aria-labelledby="catequesis-info-title">
    <header className="catequesis-info__header">
      <p className="catequesis-info__eyebrow">Información para familias</p>
      <h1 id="catequesis-info-title">{CATEQUESIS_INTRO.titulo}</h1>
      <p className="catequesis-info__lead">{CATEQUESIS_INTRO.descripcion}</p>
      <p className="catequesis-info__note">{CATEQUESIS_INTRO.notaCenacat}</p>
    </header>

    <div className="catequesis-info__grid">
      <article className="catequesis-info__group">
        <h2>Catequesis infantil</h2>
        <ul className="catequesis-info__levels">
          {CATEQUESIS_NIVELES_INFANTILES.map((item) => (
            <li key={item.nivel}>
              <strong>
                {item.nivel}: “{item.titulo}”
              </strong>
              <span>{item.descripcion}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="catequesis-info__group">
        <h2>Catequesis juvenil y confirmación</h2>
        <ul className="catequesis-info__levels">
          {CATEQUESIS_NIVELES_JUVENILES.map((item) => (
            <li key={item.nivel}>
              <strong>
                {item.nivel}: “{item.titulo}”
              </strong>
              <span>{item.descripcion}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  </section>
);

export default CatequesisInfoSection;
