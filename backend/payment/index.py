import json
from typing import Dict, Any, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class PaymentMethod(str, Enum):
    sbp = "sbp"
    tbank = "tbank"
    sber = "sber"


class CartItem(BaseModel):
    id: int
    name: str
    price: float = Field(gt=0)
    quantity: int = Field(gt=0)
    image: str


class CustomerInfo(BaseModel):
    fullName: str = Field(min_length=1)
    email: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    postalCode: str = ""


class PaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    paymentMethod: PaymentMethod
    customerInfo: CustomerInfo
    items: List[CartItem] = Field(min_items=1)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обрабатывает создание платежа для интернет-магазина.
    Поддерживает СБП, Т-Банк и Сбербанк.
    
    Args:
        event: dict с httpMethod, body, headers
        context: объект с request_id, function_name и др.
    
    Returns:
        HTTP response с paymentUrl или статусом
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        payment_req = PaymentRequest(**body_data)
        
        order_id = f"ORDER-{context.request_id[:8].upper()}"
        
        payment_urls = {
            PaymentMethod.sbp: f"https://sbp.payment.ru/pay?order={order_id}&amount={payment_req.amount}",
            PaymentMethod.tbank: f"https://securepay.tinkoff.ru/pay?order={order_id}&amount={payment_req.amount}",
            PaymentMethod.sber: f"https://securepayments.sberbank.ru/payment?order={order_id}&amount={payment_req.amount}"
        }
        
        result = {
            'success': True,
            'orderId': order_id,
            'amount': payment_req.amount,
            'paymentMethod': payment_req.paymentMethod.value,
            'paymentUrl': payment_urls[payment_req.paymentMethod],
            'customer': {
                'name': payment_req.customerInfo.fullName,
                'email': payment_req.customerInfo.email,
                'phone': payment_req.customerInfo.phone
            },
            'itemsCount': len(payment_req.items),
            'status': 'pending'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Invalid request',
                'message': str(e)
            }),
            'isBase64Encoded': False
        }
