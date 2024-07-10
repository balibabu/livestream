import React from 'react'
import Home from './components/Home'
import { HashRouter, Route, Routes } from 'react-router-dom';
import StreamPage from './components/StreamPage';
import WatchStream from './components/WatchStream';


export default function App() {
    return (
        <HashRouter>
            <Routes >
                <Route path="/" element={<Home />} />
                <Route path="/stream" element={<StreamPage />} />
                <Route path="/watch" element={<WatchStream />} />
            </Routes>
        </HashRouter>
    )
}