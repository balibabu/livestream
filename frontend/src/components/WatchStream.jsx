import React, { useState } from 'react'

export default function WatchStream() {
    const [rotate, setRotate] = useState(0);

    return (
        <div className='h-dvh flex justify-center items-center'>
            <button className='bg-gray-800 p-2 z-20 fixed right-0 top-0' onClick={() => setRotate((prev) => prev + 90)}>rotate</button>
            <img alt="Live Stream" style={{ transform: `rotate(${rotate}deg)` }}  src="/video" />
        </div>
    )
}
// src="/video" 
// src='https://media.geeksforgeeks.org/auth-dashboard-uploads/Must-do-coding-questions-with-bg-%281%29.png'