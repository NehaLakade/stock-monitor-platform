import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, TextField, List, ListItem, ListItemText } from '@mui/material';

interface Stock {
  symbol: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [symbol, setSymbol] = useState('');

  useEffect(() => {
    const fetchStocks = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/watchlist/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const watchlist = response.data;
      const stockData = await Promise.all(
        watchlist.map(async (item: any) => {
          const res = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
              function: 'TIME_SERIES_INTRADAY',
              symbol: item.symbol,
              interval: '1min',
              apikey: 'YOUR_API_KEY',
            },
          });
          const timeSeries = res.data['Time Series (1min)'];
          const latestTime = Object.keys(timeSeries)[0];
          const latestPrice = timeSeries[latestTime]['1. open'];
          return { symbol: item.symbol, price: parseFloat(latestPrice) };
        })
      );
      setStocks(stockData);
    };

    fetchStocks();
  }, []);

  const handleAddStock = async () => {
    const token = localStorage.getItem('token');
    await axios.post(
      'http://localhost:8000/api/watchlist/',
      { symbol },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setSymbol('');
  };

  return (
    <Container>
      <h2>Dashboard</h2>
      <TextField label="Stock Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      <Button onClick={handleAddStock}>Add Stock</Button>
      <List>
        {stocks.map((stock) => (
          <ListItem key={stock.symbol}>
            <ListItemText primary={`${stock.symbol}: $${stock.price}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Dashboard;
