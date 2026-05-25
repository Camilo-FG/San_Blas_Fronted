import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import Rutas from "../../routes/Rutas";
import "./Navbar.css";




function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            <div className="navbar__container">
                <Link to={Rutas.home} className="navbar__logo">
                    Parroquia San Blas
                </Link>

                <nav className="navbar__menu">
                    <Link to={Rutas.home} className="navbar__link">
                        Inicio
                    </Link>

                    <Link to={Rutas.sobreNosotros} className="navbar__link">
                        Sobre Nosotros
                    </Link>

                    <Link to={Rutas.historia} className="navbar__link">
                        Historia
                    </Link>

                    <Link to={Rutas.donaciones} className="navbar__link">
                        Donaciones
                    </Link>

                    <Link to={Rutas.dashboard} className="navbar__link">
                        Dashboard
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;