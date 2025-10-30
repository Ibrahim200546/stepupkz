import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

const categories: Category[] = [
  { id: "sneakers", name: "Кроссовки", image: "👟", count: 1500 },
  { id: "boots", name: "Ботинки", image: "🥾", count: 800 },
  { id: "formal", name: "Классика", image: "👞", count: 600 },
  { id: "sandals", name: "Сандалии", image: "🩴", count: 400 },
  { id: "heels", name: "Каблуки", image: "👠", count: 700 },
  { id: "flats", name: "Балетки", image: "🥿", count: 500 },
];

const CategorySection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Категории обуви</h2>
        <p className="text-muted-foreground text-lg">Найдите идеальную пару для любого случая</p>
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
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} моделей</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
