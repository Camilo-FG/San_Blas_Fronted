import { lazy, Suspense } from "react";
import HeroSection from "../components/HeroSection";
import HeroValuesSection from "../components/HeroValuesSection";
import "./HomePage.css";

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
  return <div className="home-carousel-slot" aria-hidden="true" />;
}

function EventosPlaceholder() {
  return <div className="home-eventos-slot" aria-hidden="true" />;
}

function SobreNosotrosPlaceholder() {
  return <div className="home-sobre-slot" aria-hidden="true" />;
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
