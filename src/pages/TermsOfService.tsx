import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead 
        title={t('terms.title')}
        description={t('terms.description')}
      />
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">{t('terms.title')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('terms.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-foreground/90">
              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('terms.section1.title')}</h2>
                <p>{t('terms.section1.text')}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('terms.section2.title')}</h2>
                <p>{t('terms.section2.text')}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('terms.section3.title')}</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>{t('terms.section3.item1')}</li>
                  <li>{t('terms.section3.item2')}</li>
                  <li>{t('terms.section3.item3')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('terms.section4.title')}</h2>
                <p>{t('terms.section4.text')}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('terms.section5.title')}</h2>
                <p>{t('terms.section5.text')}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">{t('terms.section6.title')}</h2>
                <p>{t('terms.section6.text')}</p>
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

export default TermsOfService;