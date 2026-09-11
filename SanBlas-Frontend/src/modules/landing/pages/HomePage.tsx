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
      <Suspense fallback={<CarouselPlaceholder />}>
        <ServiciosCarousel />
      </Suspense>
      <Suspense fallback={<EventosPlaceholder />}>
        <EventosCarousel />
      </Suspense>
      <Suspense fallback={<SobreNosotrosPlaceholder />}>
        <SobreNosotrosSection />
      </Suspense>
    </>
  );
};

export default Home;
