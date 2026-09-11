import imageEncabezado from "../../assets/Hitoria-1.avif";
import imageCita from "../../assets/iglesia-nicoya-lista.jpg";

export const HISTORIA_TITULO = "Historia y Legado";

export const HISTORIA_HEADER_IMAGE = imageEncabezado;
export const HISTORIA_QUOTE_IMAGE = imageCita;

export const HISTORIA_DEFAULT = {
  eyebrow: "Raíces de Fe",
  subtitle: "Un tesoro colonial en el corazón de Guanacaste",
  origenes:
    "La Parroquia de San Blas, ubicada en el majestuoso cantón de Nicoya, es más que una edificación religiosa; es un símbolo indeleble de la historia colonial de Costa Rica y de la profunda devoción que caracteriza a la región Chorotega. Con orígenes que se remontan al año 1544, esta iglesia se consolida como una de las parroquias más antiguas y valiosas del país.",
  restauraciones:
    "A lo largo de los siglos, estos muros han sido testigos silenciosos del paso del tiempo. Diversos eventos naturales han puesto a prueba la fortaleza del templo, motivando importantes labores de restauración que han reafirmado la perseverancia y fe inquebrantable de la comunidad nicoyana a través de las generaciones.",
  cita: '"Un espacio donde nuestra tradición ancestral se encuentra con la paz espiritual."',
  fachada:
    "Su inconfundible fachada, su armazón de cálidos tonos blancos y su imponente techo resguardan elementos invaluables que entrelazan la influencia indígena y española. Esta mezcla se respira en cada rincón, desde el campanario hasta los históricos retablos de su interior.",
  invitacion:
    "Hoy en día, la Parroquia San Blas mantiene sus puertas abiertas y su vocación firme. Invitamos a todos los feligreses y visitantes a caminar por sus naves, sentir el legado histórico que descansa bajo su techo colonial y acompañarnos en esta gran misión espiritual.",
  videoUrl: "https://www.youtube.com/embed/KWFL_AS5Xlk",
  headerImageUrl: "",
  quoteImageUrl: "",
};

const YOUTUBE_EMBED =
  /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]+(?:\?.*)?$/;

export function esYoutubeEmbed(url: string | undefined | null): boolean {
  return typeof url === "string" && YOUTUBE_EMBED.test(url.trim());
}

export function normalizarYoutubeEmbed(url: string): string {
  const valor = url.trim();
  const embed = valor.match(
    /^https:\/\/(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]+)/i,
  );
  if (embed) return `https://www.youtube.com/embed/${embed[1]}`;

  const watch = valor.match(/[?&]v=([A-Za-z0-9_-]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;

  const corto = valor.match(/^https:\/\/youtu\.be\/([A-Za-z0-9_-]+)/i);
  if (corto) return `https://www.youtube.com/embed/${corto[1]}`;

  return valor;
}
