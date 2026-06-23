import { useNavigate, useRouterState } from "@tanstack/react-router";
import Rutas from "../../../routes/Rutas";
import "./Footer.css";

const LOGO_URL = "/logo.png";
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
                </div>
            </div>

            <div className="footer__bottom">
                <p>© {new Date().getFullYear()} Parroquia San Blas. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;