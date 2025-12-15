import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  image: string;
  count: number;
}

const categories: Category[] = [
  { id: "sneakers", image: "👟", count: 1500 },
  { id: "boots", image: "🥾", count: 800 },
  { id: "formal", image: "👞", count: 600 },
  { id: "sandals", image: "🩴", count: 400 },
  { id: "heels", image: "👠", count: 700 },
  { id: "flats", image: "🥿", count: 500 },
];

const CategorySection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.categoryTitle')}</h2>
        <p className="text-muted-foreground text-lg">{t('home.categoryDesc')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/catalog?category=${category.id}`}
          >
            <Card className="p-6 text-center hover:shadow-card-hover transition-smooth cursor-pointer group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-smooth">
                {category.image}
              </div>
              <h3 className="font-semibold mb-1">{t(`categories.${category.id}`)}</h3>
              <p className="text-sm text-muted-foreground">{category.count} {t('categories.models')}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
