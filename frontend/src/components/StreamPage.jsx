import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client';

let instVal = false;
export default function StreamPage() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentCamera, setCurrentCamera] = useState('user');
    const mediaStream = useRef(null);
    const socket = useRef(null);
    const [values, setValues] = useState({ w: 1920, h: 1080, cid: 0 });
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        socket.current = io();
        getids()

        return () => {
            stopStreaming();
            socket.current.disconnect();
        };
    }, []);

    const toggleStreaming = async () => {
        if (isStreaming) {
            stopStreaming();
        } else {
            await startStreaming();
        }
    };

    const startStreaming = async () => {
        try {
            const constraints = {
                video: {
                    deviceId: values.cid,
                    width: { ideal: values.w },
                    height: { ideal: values.h }
                }
            };
            mediaStream.current = await navigator.mediaDevices.getUserMedia(constraints);
            setIsStreaming(true);
            instVal = true;
            sendFrames();
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopStreaming = () => {
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
        }
        setIsStreaming(false);
        instVal = false;
        socket.current.emit('stop_recording');
    };

    const switchCamera = async () => {
        setCurrentCamera(prevCamera => (prevCamera === 'user' ? 'environment' : 'user'));
        if (isStreaming) {
            stopStreaming();
            await startStreaming();
        }
    };

    const sendFrames = async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const video = document.createElement('video');

        video.srcObject = mediaStream.current;
        await video.play();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        while (instVal) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            socket.current.emit('frame', { image: imageData });
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    };

    function handleValuesChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [name]: value }))
    }

    async function getids() {
        if (!navigator.mediaDevices?.enumerateDevices) {
            alert("enumerateDevices() not supported.");
        } else {
            // List cameras and microphones.
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    setDevices(devices)
                })
                .catch((err) => {
                    console.error(`${err.name}: ${err.message}`);
                });
        }

    }

    return (
        <div className='text-center  m-5'>
            <button onClick={toggleStreaming} className='text-xl bg-gray-700  py-3 px-10 rounded-xl text-gray-100 mb-2'>
                {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
            </button>
            <br />
            <button onClick={switchCamera}>
                Switch Camera - {currentCamera}
            </button>
            <select name="cid" onChange={handleValuesChange} value={values.cid} className='text-black'>
                {devices.map((device, i) => <option key={i} value={device.deviceId}>{device.label}</option>)}
            </select>
            <div >
                {/* <div>Camera id <input className='text-gray-900 px-3' type="text" value={values.cid} onChange={handleValuesChange} name='cid' /></div> */}
                <div>width <input className='text-gray-900 px-3' type="number" value={values.w} onChange={handleValuesChange} name='w' /></div>
                <div>height <input className='text-gray-900 px-3' type="number" value={values.h} onChange={handleValuesChange} name='h' /></div>
            </div>

        </div>
    );
}
