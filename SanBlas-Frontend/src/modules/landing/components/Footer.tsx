import { useNavigate, useRouterState } from "@tanstack/react-router";
import Rutas from "../../../routes/Rutas";
import "./Footer.css";

const LOGO_URL = "/logo.png";
const FACEBOOK_URL = "https://www.facebook.com/ParroquiaNicoya1544";

function FacebookIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={20}
            height={20}
            aria-hidden="true"
            fill="currentColor"
        >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}
const HERO_SECTION_ID = "inicio";

function scrollToHero() {
    document.getElementById(HERO_SECTION_ID)?.scrollIntoView({ behavior: "smooth" });
}

function Footer() {
    const navigate = useNavigate();
    const pathname = useRouterState({ select: (state) => state.location.pathname });

    const handleGoToHero = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        const isHome = pathname === Rutas.home;

        if (isHome) {
            scrollToHero();
            window.history.replaceState(null, "", `${Rutas.home}#${HERO_SECTION_ID}`);
            return;
        }

        void navigate({ to: Rutas.home, hash: HERO_SECTION_ID }).finally(() => {
            window.setTimeout(scrollToHero, 150);
        });
    };

    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__brand">
                    <a
                        href={`${Rutas.home}#${HERO_SECTION_ID}`}
                        className="footer__brand-link"
                        onClick={handleGoToHero}
                        aria-label="Ir al inicio - Parroquia San Blas"
                    >
                        <img
                            src={LOGO_URL}
                            alt=""
                            className="footer__logo-img"
                            width={52}
                            height={52}
                            decoding="async"
                        />
                        <span className="footer__brand-name">Parroquia San Blas</span>
                    </a>
                    <p className="footer__description">
                        Comunidad parroquial dedicada a la fe, la tradición y el servicio
                        espiritual de las familias de Nicoya.
                    </p>
                </div>

                <div className="footer__section">
                    <h3 className="footer__title">Navegación</h3>
                    <ul className="footer__list">
                        <li><a href="/" className="footer__link">Inicio</a></li>
                        <li><a href="/#sobre-nosotros" className="footer__link">Sobre Nosotros</a></li>
                        <li><a href="/historia" className="footer__link">Historia</a></li>
                        <li><a href="/dashboard" className="footer__link">Dashboard</a></li>
                    </ul>
                </div>

                <div className="footer__section">
                    <h3 className="footer__title">Servicios</h3>
                    <ul className="footer__list">
                        <li><a href="/solicitudes-catequesis" className="footer__link">Catequesis</a></li>
                        <li><a href="/solicitudes-sacramentos" className="footer__link">Solicitudes de Sacramentos</a></li>
                        <li><a href="/bautizos" className="footer__link">Bautizos</a></li>
                        <li><a href="/horarios" className="footer__link">Horarios</a></li>
                        <li><a href="/contacto" className="footer__link">Contacto</a></li>
                    </ul>
                </div>

                <div className="footer__section">
                    <h3 className="footer__title">Contacto</h3>
                    <p className="footer__text">Nicoya, Guanacaste</p>
                    <p className="footer__text">Costa Rica</p>
                    <p className="footer__text">Tel: +506 0000-0000</p>
                    <p className="footer__text">Correo: parroquiasanblas@gmail.com</p>
                    <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer__social-link"
                        aria-label="Facebook de Parroquia San Blas"
                    >
                        <FacebookIcon />
                    </a>
                </div>
            </div>

            <div className="footer__bottom">
                <p>© {new Date().getFullYear()} Parroquia San Blas. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;