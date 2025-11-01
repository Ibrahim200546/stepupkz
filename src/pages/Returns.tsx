import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { RefreshCw, Package, CreditCard, Mail } from "lucide-react";

const Returns = () => {
  const { t } = useTranslation();

  const returnPoints = [
    { icon: RefreshCw, text: t('returns.text1') },
    { icon: Package, text: t('returns.text2') },
    { icon: CreditCard, text: t('returns.text3') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('returns.title')}</h1>
        
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="space-y-6 mb-8">
              {returnPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <point.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-lg pt-2">{point.text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-4 p-6 bg-accent/50 rounded-lg">
              <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="pt-2">
                <p className="text-lg mb-2">{t('returns.text4')}</p>
                <a 
                  href="mailto:tanirbergenibrahim44@gmail.com" 
                  className="text-primary font-medium hover:underline"
                >
                  {t('returns.email')}
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

export default Returns;
