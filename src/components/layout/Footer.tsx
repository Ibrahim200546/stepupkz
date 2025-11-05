import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">StepUp Shoes</h3>
            <p className="text-sm text-muted-foreground">
              {t('about.description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.about')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-smooth">{t('footer.about')}</Link></li>
              <li><Link to="/delivery" className="text-muted-foreground hover:text-primary transition-smooth">{t('footer.delivery')}</Link></li>
              <li><Link to="/returns" className="text-muted-foreground hover:text-primary transition-smooth">{t('footer.returns')}</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-smooth">{t('footer.faq')}</Link></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-smooth">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-smooth">{t('footer.terms')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contact')}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">{t('footer.address')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+77762675957" className="text-muted-foreground hover:text-primary transition-smooth">
                  {t('footer.phone')}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:tanirbergenibrahim44@gmail.com" className="text-muted-foreground hover:text-primary transition-smooth">
                  {t('footer.email')}
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">StepUp Shoes</h4>
            <div className="space-y-2 text-sm">
              <Link to="/catalog" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('nav.catalog')}
              </Link>
              <Link to="/catalog?category=men" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('nav.men')}
              </Link>
              <Link to="/catalog?category=women" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('nav.women')}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
