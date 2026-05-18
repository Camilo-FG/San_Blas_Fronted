import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
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
                <Link to="/" className="navbar__logo">
                    Parroquia San Blas
                </Link>

                <nav className="navbar__menu">
                    <Link to="/" className="navbar__link">
                        Inicio
                    </Link>

                    <Link to="/sobre-nosotros" className="navbar__link">
                        Sobre Nosotros
                    </Link>

                    <Link to="/historia" className="navbar__link">
                        Historia
                    </Link>

                    <Link to="/dashboard" className="navbar__link">
                        Dashboard
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;