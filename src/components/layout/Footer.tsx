import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">StepUp</h3>
            <p className="text-sm text-muted-foreground">
              Крупнейший онлайн-магазин обуви в Казахстане. Качество, комфорт и стиль с 2010 года.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Покупателям</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-smooth">
                  О компании
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-muted-foreground hover:text-primary transition-smooth">
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-primary transition-smooth">
                  Возврат и обмен
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-smooth">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Категории</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalog?category=men" className="text-muted-foreground hover:text-primary transition-smooth">
                  Мужская обувь
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=women" className="text-muted-foreground hover:text-primary transition-smooth">
                  Женская обувь
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=kids" className="text-muted-foreground hover:text-primary transition-smooth">
                  Детская обувь
                </Link>
              </li>
              <li>
                <Link to="/catalog?sale=true" className="text-muted-foreground hover:text-primary transition-smooth">
                  Распродажа
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Телефон:</strong>
                <br />
                <a href="tel:+77001234567" className="hover:text-primary transition-smooth">
                  +7 (700) 123-45-67
                </a>
              </li>
              <li>
                <strong className="text-foreground">Email:</strong>
                <br />
                <a href="mailto:info@stepup.kz" className="hover:text-primary transition-smooth">
                  info@stepup.kz
                </a>
              </li>
              <li>
                <strong className="text-foreground">Адрес:</strong>
                <br />
                г. Алматы, ул. Абая 150
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StepUp. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
