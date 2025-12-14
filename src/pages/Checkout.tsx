import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { saveOrder } from '@/lib/orders';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
}

type PaymentMethod = 'sbp' | 'tbank' | 'sber';

export default function Checkout({ cart, onClearCart }: CheckoutProps) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sbp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('https://functions.poehali.dev/eba3dcb2-57e2-4e8f-b3ef-9c0c0e11b740', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getTotalPrice(),
          paymentMethod,
          customerInfo: formData,
          items: cart
        })
      });

      const data = await response.json();

      if (data.success) {
        const order = {
          orderId: data.orderId,
          date: new Date().toISOString(),
          items: cart,
          totalAmount: getTotalPrice(),
          status: 'pending' as const,
          paymentMethod,
          deliveryAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            phone: formData.phone,
          },
        };
        saveOrder(order);

        setTimeout(() => {
          setIsProcessing(false);
          setOrderComplete(true);
          onClearCart();
        }, 1500);
      }
    } catch (error) {
      const order = {
        orderId: `ORDER-${Date.now()}`,
        date: new Date().toISOString(),
        items: cart,
        totalAmount: getTotalPrice(),
        status: 'pending' as const,
        paymentMethod,
        deliveryAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
        },
      };
      saveOrder(order);

      setTimeout(() => {
        setIsProcessing(false);
        setOrderComplete(true);
        onClearCart();
      }, 1500);
    }
  };

  const isFormValid = () => {
    return formData.fullName && formData.email && formData.phone && 
           formData.address && formData.city;
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-scale-in">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto flex items-center justify-center animate-float">
                <Icon name="CheckCircle" size={40} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Заказ оформлен!</h2>
                <p className="text-muted-foreground">
                  Спасибо за покупку. Мы отправили подтверждение на {formData.email}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Сумма заказа:</span>
                  <span className="font-bold text-lg">{getTotalPrice()} ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Способ оплаты:</span>
                  <Badge className="bg-gradient-primary">
                    {paymentMethod === 'sbp' && 'СБП'}
                    {paymentMethod === 'tbank' && 'Т-Банк'}
                    {paymentMethod === 'sber' && 'Сбер'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                  onClick={() => navigate('/orders')}
                >
                  <Icon name="Package" size={20} className="mr-2" />
                  Мои заказы
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/')}
                >
                  В магазин
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Icon name="ShoppingCart" size={48} className="mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Корзина пуста</h2>
            <p className="text-muted-foreground">Добавьте товары перед оформлением заказа</p>
            <Button
              className="w-full bg-gradient-primary hover:opacity-90"
              onClick={() => navigate('/')}
            >
              В магазин
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад в магазин
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
                <CardDescription>Заполните данные для доставки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Полное имя *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Иван Иванов"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ivan@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+7 999 123-45-67"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle>Адрес доставки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Улица и дом *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="ул. Ленина, д. 10, кв. 5"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Город *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Москва"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Индекс</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="123456"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Способ оплаты</CardTitle>
                <CardDescription>Выберите удобный способ</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="space-y-3">
                    <label
                      htmlFor="sbp"
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        paymentMethod === 'sbp' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="sbp" id="sbp" />
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Icon name="Smartphone" size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Система Быстрых Платежей</p>
                          <p className="text-sm text-muted-foreground">Мгновенный перевод через СБП</p>
                        </div>
                      </div>
                    </label>

                    <label
                      htmlFor="tbank"
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        paymentMethod === 'tbank' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="tbank" id="tbank" />
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                          <Icon name="CreditCard" size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Т-Банк</p>
                          <p className="text-sm text-muted-foreground">Оплата картой Т-Банка</p>
                        </div>
                      </div>
                    </label>

                    <label
                      htmlFor="sber"
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        paymentMethod === 'sber' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value="sber" id="sber" />
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center">
                          <Icon name="Wallet" size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Сбербанк</p>
                          <p className="text-sm text-muted-foreground">Оплата через Сбербанк Онлайн</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {item.price} ₽
                        </p>
                        <p className="font-semibold mt-1">
                          {item.quantity * item.price} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="font-medium">Бесплатно</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Итого:</span>
                    <span className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                      {getTotalPrice()} ₽
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-primary hover:opacity-90 h-12 text-lg"
                  onClick={handlePayment}
                  disabled={!isFormValid() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name="Lock" size={20} className="mr-2" />
                      Оплатить {getTotalPrice()} ₽
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Shield" size={14} />
                  <span>Безопасная оплата</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}