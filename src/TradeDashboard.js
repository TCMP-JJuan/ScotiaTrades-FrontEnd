// src/TradeDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './TradeDashboard.css'; // Import your CSS file

const TradeDashboard = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortKey, setSortKey] = useState('underlyingInstrumentName');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/trades');
                setTrades(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
    }, []);

    const handleSort = (key) => {
        const order = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortKey(key);
        setSortOrder(order);
    };

    const sortedTrades = [...trades].sort((a, b) => {
        const aValue = a.tradeMessage.trade.product.fxOption[sortKey];
        const bValue = b.tradeMessage.trade.product.fxOption[sortKey];

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredTrades = sortedTrades.filter(trade => {
        const fxOption = trade.tradeMessage.trade.product.fxOption;
        return (
            fxOption.underlyingInstrumentName.toLowerCase().includes(filter.toLowerCase()) ||
            fxOption.baseCurrency.toLowerCase().includes(filter.toLowerCase())
        );
    });

    const premiumData = filteredTrades.map(trade => ({
        date: trade.tradeMessage.trade.product.fxOption.premiumPaymentDate,
        amount: trade.tradeMessage.trade.product.fxOption.premiumPaymentAmount,
    }));

    const strikeRateData = filteredTrades.map(trade => ({
        date: trade.tradeMessage.trade.product.fxOption.premiumPaymentDate,
        strikeRate: trade.tradeMessage.trade.product.fxOption.strikeRate,
    }));

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading trades: {error.message}</div>;

    return (
        <div>
            <h1>Trade Dashboard</h1>
            <input
                type="text"
                placeholder="Filter by Instrument or Currency"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('buySell')}>Buy/Sell</th>
                        <th onClick={() => handleSort('underlyingInstrumentName')}>Underlying Instrument</th>
                        <th onClick={() => handleSort('baseCurrency')}>Base Currency</th>
                        <th onClick={() => handleSort('premiumPaymentDate')}>Premium Payment Date</th>
                        <th onClick={() => handleSort('premiumPaymentAmount')}>Premium Payment Amount</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTrades.map((trade, index) => {
                        const fxOption = trade.tradeMessage.trade.product.fxOption;
                        return (
                            <tr key={index}>
                                <td>{fxOption.buySell}</td>
                                <td>{fxOption.underlyingInstrumentName}</td>
                                <td>{fxOption.baseCurrency}</td>
                                <td>{fxOption.premiumPaymentDate}</td>
                                <td>{fxOption.premiumPaymentAmount}</td>
                                <td>
                                    <button onClick={() => alert(JSON.stringify(fxOption, null, 2))}>
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <h2>Premium Payment Amount Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={premiumData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>

            <h2>Strike Rate Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={strikeRateData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="strikeRate" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TradeDashboard;