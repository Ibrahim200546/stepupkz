import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('about.title')}</h1>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-8">
            <p className="text-lg mb-4 text-muted-foreground">{t('about.description')}</p>
            <p className="text-lg mb-4">{t('about.text1')}</p>
            <p className="text-lg">{t('about.text2')}</p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">{t('footer.contact')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">{t('footer.address')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:+77762675957" className="text-muted-foreground hover:text-primary transition-smooth">
                  {t('footer.phone')}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:tanirbergenibrahim44@gmail.com" className="text-muted-foreground hover:text-primary transition-smooth">
                  {t('footer.email')}
                </a>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
