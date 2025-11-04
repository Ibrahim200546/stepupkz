import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead 
        title={t('privacy.title')}
        description={t('privacy.description')}
      />
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">{t('privacy.title')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-foreground/90">
              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('privacy.section1.title')}</h2>
                <p>{t('privacy.section1.text')}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('privacy.section2.title')}</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>{t('privacy.section2.item1')}</li>
                  <li>{t('privacy.section2.item2')}</li>
                  <li>{t('privacy.section2.item3')}</li>
                  <li>{t('privacy.section2.item4')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('privacy.section3.title')}</h2>
                <p>{t('privacy.section3.text')}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('privacy.section4.title')}</h2>
                <p>{t('privacy.section4.text')}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('privacy.section5.title')}</h2>
                <p>{t('privacy.section5.text')}</p>
                <p className="mt-2">Email: tanirbergenibrahim44@gmail.com</p>
              </section>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;