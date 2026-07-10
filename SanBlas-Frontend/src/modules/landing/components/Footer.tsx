import { useNavigate, useRouterState } from "@tanstack/react-router";
import Rutas from "../../../routes/Rutas";

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

    const linkClass =
        "text-[13px] font-semibold text-white/72 no-underline transition-all hover:pl-1 hover:text-royal-gold";

    return (
        <footer className="border-t-[3px] border-royal-gold bg-royal-blue px-8 pb-4 pt-10 text-white max-sm:px-5 max-sm:pt-8">
            <div className="mx-auto grid max-w-7xl grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-8 max-[950px]:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-6 max-sm:text-center">
                <div>
                    <a
                        href={`${Rutas.home}#${HERO_SECTION_ID}`}
                        className="mb-3 inline-flex items-center gap-3 no-underline transition-all hover:-translate-y-px hover:opacity-90 max-sm:justify-center group"
                        onClick={handleGoToHero}
                        aria-label="Ir al inicio - Parroquia San Blas"
                    >
                        <img
                            src={LOGO_URL}
                            alt=""
                            className="block size-[52px] shrink-0 rounded-full object-cover"
                            width={52}
                            height={52}
                            decoding="async"
                        />
                        <span className="font-heading text-[22px] font-extrabold uppercase leading-tight tracking-wide text-white transition-colors group-hover:text-royal-gold max-sm:text-lg">
                            Parroquia San Blas
                        </span>
                    </a>
                    <p className="max-w-xs text-sm leading-relaxed text-white/72 max-sm:max-w-full">
                        Comunidad parroquial dedicada a la fe, la tradición y el servicio
                        espiritual de las familias de Nicoya.
                    </p>
                </div>

                <div>
                    <h3 className="mb-3 text-xs font-black uppercase tracking-[2px] text-royal-gold">
                        Navegación
                    </h3>
                    <ul className="m-0 list-none p-0">
                        <li className="mb-2"><a href="/" className={linkClass}>Inicio</a></li>
                        <li className="mb-2"><a href="/#sobre-nosotros" className={linkClass}>Sobre Nosotros</a></li>
                        <li className="mb-2"><a href="/historia" className={linkClass}>Historia</a></li>
                        <li className="mb-2"><a href="/dashboard" className={linkClass}>Dashboard</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-3 text-xs font-black uppercase tracking-[2px] text-royal-gold">
                        Servicios
                    </h3>
                    <ul className="m-0 list-none p-0">
                        <li className="mb-2"><a href="/solicitudes-catequesis" className={linkClass}>Catequesis</a></li>
                        <li className="mb-2"><a href="/solicitudes-sacramentos" className={linkClass}>Solicitudes de Sacramentos</a></li>
                        <li className="mb-2"><a href="/bautizos" className={linkClass}>Bautizos</a></li>
                        <li className="mb-2"><a href="/horarios" className={linkClass}>Horarios</a></li>
                        <li className="mb-2"><a href="/contacto" className={linkClass}>Contacto</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-3 text-xs font-black uppercase tracking-[2px] text-royal-gold">
                        Contacto
                    </h3>
                    <p className="mb-2 text-[13px] leading-normal text-white/72">Nicoya, Guanacaste</p>
                    <p className="mb-2 text-[13px] leading-normal text-white/72">Costa Rica</p>
                    <p className="mb-2 text-[13px] leading-normal text-white/72">Tel: +506 0000-0000</p>
                    <p className="mb-2 text-[13px] leading-normal text-white/72">Correo: parroquiasanblas@gmail.com</p>
                    <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex size-10 items-center justify-center rounded-full border border-royal-gold/45 text-white no-underline transition-all hover:-translate-y-px hover:border-[#1877f2] hover:bg-[#1877f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal-gold focus-visible:outline-offset-[3px]"
                        aria-label="Facebook de Parroquia San Blas"
                    >
                        <FacebookIcon />
                    </a>
                </div>
            </div>

            <div className="mx-auto mt-7 max-w-7xl border-t border-royal-gold/35 pt-4 text-center text-xs text-white/55">
                <p>© {new Date().getFullYear()} Parroquia San Blas. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;
