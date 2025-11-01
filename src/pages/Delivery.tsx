import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Truck, Package, Clock, DollarSign, MessageSquare } from "lucide-react";

const Delivery = () => {
  const { t } = useTranslation();

  const deliveryPoints = [
    { icon: Clock, text: t('delivery.text1') },
    { icon: Truck, text: t('delivery.text2') },
    { icon: DollarSign, text: t('delivery.text3') },
    { icon: Package, text: t('delivery.text4') },
    { icon: MessageSquare, text: t('delivery.text5') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('delivery.title')}</h1>
        
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="space-y-6">
              {deliveryPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <point.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-lg pt-2">{point.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Delivery;
