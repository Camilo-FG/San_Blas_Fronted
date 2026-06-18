import { lazy, Suspense } from "react";
import HeroSection from "../components/HeroSection";
import "./HomePage.css";

const ServiciosCarousel = lazy(
  () => import("../components/ServiciosCarrusel"),
);
const SobreNosotrosSection = lazy(
  () => import("../components/SobreNosotrosSection"),
);

function CarouselPlaceholder() {
  return <div className="home-carousel-slot" aria-hidden="true" />;
}

function SobreNosotrosPlaceholder() {
  return <div className="home-sobre-slot" aria-hidden="true" />;
}

const Home = () => {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<CarouselPlaceholder />}>
        <ServiciosCarousel />
      </Suspense>
      <Suspense fallback={<SobreNosotrosPlaceholder />}>
        <SobreNosotrosSection />
      </Suspense>
    </>
  );
};

export default Home;
