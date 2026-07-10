import image1 from "../../../assets/Hitoria-1.avif";
import image2 from "../../../assets/iglesia-nicoya-lista.jpg";

function HistoriaSection() {
  return (
    <section className="w-full bg-surface">
      <div
        className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-fixed bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image1})` }}
      >
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-royal-blue/60 to-royal-blue/30" />
        <h1 className="relative z-[2] m-0 p-5 text-center font-heading text-[clamp(36px,6vw,64px)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          Historia y Legado
        </h1>
      </div>

      <div className="mx-auto max-w-[860px] px-6 py-20 max-sm:px-5 max-sm:py-[50px]">
        <span className="mb-3 block text-center text-sm font-bold uppercase tracking-[0.2em] text-royal-gold">
          Raíces de Fe
        </span>
        <h2 className="mb-8 text-center font-heading text-[clamp(28px,4vw,42px)] leading-tight text-royal-blue">
          Un tesoro colonial en el corazón de Guanacaste
        </h2>
        <div className="flex flex-col gap-5">
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            La Parroquia de San Blas, ubicada en el majestuoso cantón de Nicoya,
            es más que una edificación religiosa; es un símbolo indeleble de la historia
            colonial de Costa Rica y de la profunda devoción que caracteriza a la región Chorotega.
            Con orígenes que se remontan al año 1544, esta iglesia se consolida como una de las
            parroquias más antiguas y valiosas del país.
          </p>
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            A lo largo de los siglos, estos muros han sido testigos silenciosos del paso
            del tiempo. Diversos eventos naturales han puesto a prueba la fortaleza del templo,
            motivando importantes labores de restauración que han reafirmado la perseverancia
            y fe inquebrantable de la comunidad nicoyana a través de las generaciones.
          </p>
        </div>
      </div>

      <div
        className="relative flex min-h-[40vh] items-center justify-center bg-cover bg-fixed bg-center bg-no-repeat px-5"
        style={{ backgroundImage: `url(${image2})` }}
      >
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-royal-blue/60 to-royal-blue/30" />
        <div className="relative z-[2] max-w-[800px] text-center font-heading text-[clamp(20px,3.5vw,32px)] leading-snug text-white shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
          "Un espacio donde nuestra tradición ancestral se encuentra con la paz espiritual."
        </div>
      </div>

      <div className="mx-auto max-w-[860px] px-6 py-20 max-sm:px-5 max-sm:py-[50px]">
        <div className="flex flex-col gap-5">
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            Su inconfundible fachada, su armazón de cálidos tonos blancos y su imponente
            techo resguardan elementos invaluables que entrelazan la influencia indígena y española.
            Esta mezcla se respira en cada rincón, desde el campanario hasta los históricos retablos de su interior.
          </p>
          <p className="text-justify text-[1.1rem] leading-[1.8] text-text-secondary max-sm:text-base">
            Hoy en día, la Parroquia San Blas mantiene sus puertas abiertas y su vocación
            firme. Invitamos a todos los feligreses y visitantes a caminar por sus naves,
            sentir el legado histórico que descansa bajo su techo colonial y acompañarnos
            en esta gran misión espiritual.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 pb-[100px] pt-5">
        <div className="relative h-0 overflow-hidden rounded-xl bg-black pb-[56.25%] shadow-[0_16px_32px_rgba(0,0,0,0.1)]">
          <iframe
            className="absolute inset-0 size-full border-0"
            src="https://www.youtube.com/embed/KWFL_AS5Xlk"
            title="Historia de la Parroquia San Blas"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export default HistoriaSection;
