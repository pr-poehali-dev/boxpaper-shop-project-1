import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { getOrders, deleteOrder, Order } from '@/lib/orders';

const statusConfig = {
  pending: { label: 'Ожидает', color: 'bg-yellow-500' },
  confirmed: { label: 'Подтвержден', color: 'bg-blue-500' },
  delivered: { label: 'Доставлен', color: 'bg-green-500' },
  cancelled: { label: 'Отменен', color: 'bg-red-500' },
};

const paymentMethodConfig = {
  sbp: { label: 'СБП', icon: 'Smartphone' },
  tbank: { label: 'Т-Банк', icon: 'CreditCard' },
  sber: { label: 'Сбербанк', icon: 'Wallet' },
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    setOrders(getOrders());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            На главную
          </Button>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto flex items-center justify-center opacity-50">
                <Icon name="Package" size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Заказов пока нет</h2>
              <p className="text-muted-foreground">
                Оформите первый заказ, и он появится здесь
              </p>
              <Button
                className="bg-gradient-primary hover:opacity-90 mt-4"
                onClick={() => navigate('/')}
              >
                <Icon name="ShoppingBag" size={20} className="mr-2" />
                В магазин
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/')}
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              На главную
            </Button>
            <h1 className="text-4xl font-bold">История заказов</h1>
            <p className="text-muted-foreground mt-2">
              Всего заказов: {orders.length}
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          {orders.map((order, index) => (
            <Card
              key={order.orderId}
              className="animate-fade-in hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">Заказ #{order.orderId}</CardTitle>
                      <Badge className={`${statusConfig[order.status].color} text-white`}>
                        {statusConfig[order.status].label}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {formatDate(order.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name={paymentMethodConfig[order.paymentMethod].icon as any} size={14} />
                        {paymentMethodConfig[order.paymentMethod].label}
                      </span>
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Icon name="Trash2" size={18} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить заказ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Заказ #{order.orderId} будет удален из истории.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteOrder(order.orderId)}
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Товары
                  </h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center bg-muted/30 rounded-lg p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {item.price} ₽
                        </p>
                      </div>
                      <div className="font-bold">
                        {item.quantity * item.price} ₽
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between bg-gradient-primary/5 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Адрес доставки</p>
                    <p className="font-medium">{order.deliveryAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryAddress.city}, {order.deliveryAddress.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryAddress.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Итого</p>
                    <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {order.totalAmount} ₽
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
