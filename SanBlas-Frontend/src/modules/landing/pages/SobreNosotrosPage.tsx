import SeoHead from "../../../seo/SeoHead";
import SobreNosotrosSection from "../components/SobreNosotrosSection";

function SobreNosotrosPage() {
  return (
    <>
      <SeoHead page="/sobre-nosotros" />
      <main>
        <SobreNosotrosSection tituloComo="h1" />
      </main>
    </>
  );
}

export default SobreNosotrosPage;