# api/views.py
# api/views.py
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests

from .serializers import UserSerializer

# Create a view to handle user registration
class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Create a view to fetch stock data from Alpha Vantage API
class StockDataView(APIView):
    def get(self, request, symbol):
        # Replace 'your_api_key' with your actual Alpha Vantage API key
        API_KEY = 'YM0FED18F7EKZ9Z5'
        url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=1min&apikey={API_KEY}'
        
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            # Extract the latest stock price from the response
            latest_price = data['Time Series (1min)'][list(data['Time Series (1min)'].keys())[0]]['1. open']
            return Response({'symbol': symbol, 'latest_price': latest_price}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to fetch stock data'}, status=response.status_code)
