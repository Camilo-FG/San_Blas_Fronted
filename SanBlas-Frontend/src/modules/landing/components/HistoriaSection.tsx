import "./HistoriaSection.css";
import image1 from "../../../assets/Hitoria-1.avif";
import image2 from "../../../assets/iglesia-nicoya-lista.jpg";

function HistoriaSection() {
  return (
    <section className="historia-section">
      {/* Primer fondo Parallax */}
      <div 
        className="historia__parallax"
        style={{ backgroundImage: `url(${image1})` }}
      >
        <div className="historia__parallax-overlay"></div>
        <h1 className="historia__parallax-title">Historia y Legado</h1>
      </div>

      {/* Primer bloque de texto */}
      <div className="historia__content">
        <span className="historia__eyebrow">Raíces de Fe</span>
        <h2 className="historia__heading">Un tesoro colonial en el corazón de Guanacaste</h2>
        <div className="historia__text-block">
          <p className="historia__paragraph">
            La Parroquia de San Blas, ubicada en el majestuoso cantón de Nicoya,
            es más que una edificación religiosa; es un símbolo indeleble de la historia
            colonial de Costa Rica y de la profunda devoción que caracteriza a la región Chorotega.
            Con orígenes que se remontan al año 1544, esta iglesia se consolida como una de las
            parroquias más antiguas y valiosas del país.
          </p>
          <p className="historia__paragraph">
            A lo largo de los siglos, estos muros han sido testigos silenciosos del paso
            del tiempo. Diversos eventos naturales han puesto a prueba la fortaleza del templo,
            motivando importantes labores de restauración que han reafirmado la perseverancia
            y fe inquebrantable de la comunidad nicoyana a través de las generaciones.
          </p>
        </div>
      </div>

      {/* Segundo fondo Parallax */}
      <div 
        className="historia__parallax historia__parallax--mid"
        style={{ backgroundImage: `url(${image2})` }}
      >
        <div className="historia__parallax-overlay"></div>
        <div className="historia__quote">
          "Un espacio donde nuestra tradición ancestral se encuentra con la paz espiritual."
        </div>
      </div>

      {/* Segundo bloque de texto */}
      <div className="historia__content">
        <div className="historia__text-block">
          <p className="historia__paragraph">
            Su inconfundible fachada, su armazón de cálidos tonos blancos y su imponente
            techo resguardan elementos invaluables que entrelazan la influencia indígena y española.
            Esta mezcla se respira en cada rincón, desde el campanario hasta los históricos retablos de su interior.
          </p>
          <p className="historia__paragraph">
            Hoy en día, la Parroquia San Blas mantiene sus puertas abiertas y su vocación
            firme. Invitamos a todos los feligreses y visitantes a caminar por sus naves,
            sentir el legado histórico que descansa bajo su techo colonial y acompañarnos
            en esta gran misión espiritual.
          </p>
        </div>
      </div>

      {/* Contenedor del video de YouTube interactivo y responsivo */}
      <div className="historia__video-container">
        <div className="historia__video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/KWFL_AS5Xlk"
            title="Historia de la Parroquia San Blas"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}

export default HistoriaSection;