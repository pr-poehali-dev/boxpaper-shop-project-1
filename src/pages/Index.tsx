import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  { id: 1, name: 'Картхолдер MagSafe', category: 'Аксессуары', price: 350, image: 'https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg', badge: 'Хит' },
  { id: 2, name: 'Чехол силиконовый', category: 'Чехлы', price: 500, image: 'https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg' },
  { id: 3, name: 'Чехол с MagSafe', category: 'Чехлы', price: 500, image: 'https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg', badge: 'Новинка' },
  { id: 4, name: 'Чехол с наклейками', category: 'Чехлы', price: 500, image: 'https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg' },
  { id: 5, name: 'Стилус Air', category: 'Стилусы', price: 250, image: 'https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg' },
  { id: 6, name: 'Стилус Pro', category: 'Стилусы', price: 250, image: 'https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg', badge: 'Pro' },
  { id: 7, name: 'Стилус Ultra', category: 'Стилусы', price: 250, image: 'https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg', badge: 'Premium' },
];

interface IndexProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function Index({ cart, setCart }: IndexProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeSection, setActiveSection] = useState<'profile' | 'shop'>('shop');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center animate-float">
              <Icon name="Box" className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BoxPaper
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Icon name="ShoppingCart" size={20} />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Корзина</SheetTitle>
                  <SheetDescription>
                    {cart.length === 0 ? 'Ваша корзина пуста' : `${getTotalItems()} товаров`}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.price} ₽</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Icon name="Minus" size={12} />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Icon name="Plus" size={12} />
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                  {cart.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Итого:</span>
                        <span>{getTotalPrice()} ₽</span>
                      </div>
                      <Button 
                        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                        onClick={() => navigate('/checkout')}
                      >
                        Оформить заказ
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              onClick={() => setIsMenuOpen(true)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Icon name="Menu" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Меню</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Button
                variant={activeSection === 'profile' ? 'default' : 'outline'}
                className={activeSection === 'profile' ? 'bg-gradient-primary flex-1' : 'flex-1'}
                onClick={() => setActiveSection('profile')}
              >
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </Button>
              <Button
                variant={activeSection === 'shop' ? 'default' : 'outline'}
                className={activeSection === 'shop' ? 'bg-gradient-primary flex-1' : 'flex-1'}
                onClick={() => setActiveSection('shop')}
              >
                <Icon name="Store" size={16} className="mr-2" />
                Shop
              </Button>
            </div>

            <Separator />

            {activeSection === 'profile' ? (
              <div className="space-y-4 animate-fade-in">
                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Icon name="User" size={40} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Добро пожаловать!</h3>
                      <p className="text-sm text-muted-foreground">Войдите или создайте аккаунт</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">Имя</Label>
                        <Input
                          id="name"
                          placeholder="Введите ваше имя"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" />
                      </div>
                      <div>
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" placeholder="••••••••" />
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-primary hover:opacity-90"
                      onClick={() => setIsAuthenticated(true)}
                    >
                      Создать аккаунт
                    </Button>
                    <Button variant="outline" className="w-full">
                      Войти
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <div className="w-20 h-20 bg-gradient-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl text-white font-bold">
                          {userName.charAt(0).toUpperCase() || 'У'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{userName || 'Пользователь'}</h3>
                      <p className="text-sm text-muted-foreground">user@boxpaper.com</p>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/orders');
                          setIsMenuOpen(false);
                        }}
                      >
                        <Icon name="Package" size={18} className="mr-2" />
                        Мои заказы
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Icon name="Heart" size={18} className="mr-2" />
                        Избранное
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Icon name="Settings" size={18} className="mr-2" />
                        Настройки
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full text-destructive"
                      onClick={() => {
                        setIsAuthenticated(false);
                        setUserName('');
                      }}
                    >
                      <Icon name="LogOut" size={18} className="mr-2" />
                      Выйти
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-semibold text-lg">Категории</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Все', 'Чехлы', 'Стилусы', 'Аксессуары'].map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      className="h-auto py-4 hover:bg-gradient-primary hover:text-white transition-all"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <main className="pt-24 pb-12">
        <section className="container mx-auto px-4 mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 animate-fade-in">
              <Badge className="bg-gradient-secondary text-white">Новая коллекция 2024</Badge>
              <h2 className="text-5xl lg:text-7xl font-bold leading-tight">
                Аксессуары для
                <span className="bg-gradient-primary bg-clip-text text-transparent"> вашего стиля</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Премиальные чехлы, стилусы и аксессуары для iPhone с поддержкой MagSafe.
                Качество, которое чувствуется.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 transition-all hover:scale-105"
                  onClick={() => {
                    setIsMenuOpen(true);
                    setActiveSection('shop');
                  }}
                >
                  <Icon name="ShoppingBag" size={20} className="mr-2" />
                  Каталог
                </Button>
                <Button size="lg" variant="outline" className="hover:scale-105 transition-all">
                  Узнать больше
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img
                src="https://cdn.poehali.dev/projects/86abe993-0edc-4039-924d-a364b1d0b464/files/ab6b936f-0a8d-4dda-ad1a-253fb7f024ef.jpg"
                alt="Hero"
                className="relative z-10 w-full max-w-lg mx-auto animate-float rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold mb-2">Популярные товары</h3>
              <p className="text-muted-foreground">Выбор наших покупателей</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Card
                key={product.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in border-2 hover:border-primary/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.badge && (
                      <Badge className="absolute top-3 right-3 bg-gradient-accent text-white">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.category}
                      </p>
                      <h4 className="font-semibold text-lg mt-1">{product.name}</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {product.price} ₽
                      </span>
                      <Button
                        size="icon"
                        className="bg-gradient-primary hover:opacity-90 transition-all hover:scale-110"
                        onClick={() => addToCart(product)}
                      >
                        <Icon name="Plus" size={20} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 mt-24">
          <div className="bg-gradient-primary rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="text-4xl font-bold">Скидка 15% на первый заказ</h3>
              <p className="text-lg opacity-90">
                Подпишитесь на рассылку и получите промокод на скидку
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <Input
                  placeholder="Ваш email"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                <Button className="bg-white text-primary hover:bg-white/90">
                  Подписаться
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-purple-100 mt-24 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Icon name="Box" className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold">BoxPaper</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Премиальные аксессуары для вашего iPhone
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Каталог</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">Чехлы</li>
                <li className="hover:text-primary cursor-pointer">Стилусы</li>
                <li className="hover:text-primary cursor-pointer">Аксессуары</li>
                <li className="hover:text-primary cursor-pointer">Новинки</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">О компании</li>
                <li className="hover:text-primary cursor-pointer">Доставка</li>
                <li className="hover:text-primary cursor-pointer">Возврат</li>
                <li className="hover:text-primary cursor-pointer">Контакты</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  +7 (999) 123-45-67
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  info@boxpaper.ru
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 BoxPaper. Все права защищены.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-primary transition-colors">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}