import { lazy, Suspense } from "react";
import HeroSection from "../components/HeroSection";
import HeroValuesSection from "../components/HeroValuesSection";

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
    <div
      className="min-h-[700px] border-y border-[#f0f0f0] bg-surface py-24 max-md:min-h-[620px] max-md:py-[72px] max-sm:min-h-[560px] max-sm:py-16"
      aria-hidden="true"
    />
  );
}

function EventosPlaceholder() {
  return (
    <div
      className="min-h-[520px] border-t border-[#eef2f7] bg-surface-muted max-md:min-h-[460px] max-sm:min-h-[420px]"
      aria-hidden="true"
    />
  );
}

function SobreNosotrosPlaceholder() {
  return (
    <div
      className="min-h-[920px] bg-surface max-md:min-h-[780px]"
      aria-hidden="true"
    />
  );
}

const Home = () => {
  return (
    <>
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
