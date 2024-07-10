import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate();
    
    return (
        <div className='text-center  m-5'>
            <button className='text-xl bg-gray-700  py-3 px-10 rounded-xl text-gray-100 mb-2' onClick={()=>navigate('/stream')}>Goto Stream Page</button> <br />
            <button className='text-xl bg-gray-700  py-3 px-10 rounded-xl text-gray-100' onClick={()=>navigate('/watch')}>Watch Live Stream</button>
        </div>
    )
}
