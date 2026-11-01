import { lazy, Suspense } from "react";
import SeoHead from "../../../seo/SeoHead";
import HeroSection from "../components/HeroSection";
import HeroValuesSection from "../components/HeroValuesSection";
import { LandingLoader } from "../components/LandingLoader";

const ServiciosCarousel = lazy(
  () => import("../components/ServiciosCarrusel"),
);
const EventosCarousel = lazy(
  () => import("../components/EventosCarousel"),
);
const SobreNosotrosSection = lazy(
  () => import("../components/SobreNosotrosSection"),
);

function CarouselPlaceholder() {
  return (
    <div className="flex min-h-[700px] items-center justify-center border-y border-[#f0f0f0] bg-surface py-24 max-md:min-h-[620px] max-md:py-[72px] max-sm:min-h-[560px] max-sm:py-16">
      <LandingLoader compact />
    </div>
  );
}

function EventosPlaceholder() {
  return (
    <div className="flex min-h-[580px] items-center justify-center border-t border-[#eef2f7] bg-surface-muted max-md:min-h-[520px] max-sm:min-h-[470px]">
      <LandingLoader compact />
    </div>
  );
}

function SobreNosotrosPlaceholder() {
  return (
    <div className="flex min-h-[1080px] items-center justify-center bg-surface max-md:min-h-[860px]">
      <LandingLoader compact />
    </div>
  );
}

const Home = () => {
  return (
    <>
      <SeoHead page="/" />
      <HeroSection />
      <HeroValuesSection />
      <section
        aria-label="Parroquia San Blas de Nicoya"
        className="bg-surface-muted px-[8%] py-10 max-[900px]:px-8 max-sm:px-[18px]"
      >
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="m-0 mb-3 font-heading text-[1.55rem] font-extrabold text-royal-blue max-sm:text-[1.3rem]">
            Parroquia San Blas de Nicoya
          </h2>
          <p className="m-0 text-base leading-relaxed text-text-secondary">
            Iglesia católica en el centro de Nicoya, Guanacaste. Encuentre
            horarios de misa, información de bautizos, catequesis, constancias
            sacramentales y eventos de la comunidad parroquial.
          </p>
        </div>
      </section>
      <div className="cv-auto">
        <Suspense fallback={<CarouselPlaceholder />}>
          <ServiciosCarousel />
        </Suspense>
      </div>
      <div className="cv-auto">
        <Suspense fallback={<EventosPlaceholder />}>
          <EventosCarousel />
        </Suspense>
      </div>
      <div className="cv-auto">
        <Suspense fallback={<SobreNosotrosPlaceholder />}>
          <SobreNosotrosSection />
        </Suspense>
      </div>
    </>
  );
};

export default Home;
