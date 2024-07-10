import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client';

let instVal = false;
const storedObject = localStorage.getItem('params');
export default function StreamPage() {
    const [isStreaming, setIsStreaming] = useState(false);
    const mediaStream = useRef(null);
    const socket = useRef(null);
    const [values, setValues] = useState(storedObject ? JSON.parse(storedObject) : { w: 1280, h: 720, cid: 0, color: 8 });
    const [devices, setDevices] = useState([]);
    const wakeLock = useRef(null);

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
                    height: { ideal: values.h },
                    colorDepth: { ideal: values.color }
                }
            };
            mediaStream.current = await navigator.mediaDevices.getUserMedia(constraints);
            setIsStreaming(true);
            instVal = true;
            try {
                wakeLock.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock is active');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
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
        if (wakeLock.current) {
            wakeLock.current.release()
                .then(() => {
                    wakeLock.current = null;
                    console.log('Wake Lock has been released');
                })
                .catch((err) => {
                    console.error(`${err.name}, ${err.message}`);
                });
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
            await new Promise(resolve => setTimeout(resolve, 40)); // 24fps
        }
    };

    function handleValuesChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setValues((prev) => {
            const newValues = { ...prev, [name]: value };
            localStorage.setItem('params', JSON.stringify(newValues));
            return newValues
        })
    }

    async function getids() {
        if (!navigator.mediaDevices?.enumerateDevices) {
            alert("enumerateDevices() not supported.");
        } else {
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
            <div>
                <select name="cid" onChange={handleValuesChange} value={values.cid} className='text-black'>
                    {devices.map((device, i) => <option key={i} value={device.deviceId}>{device.label}</option>)}
                </select>
                <div>width <input className='text-gray-900 px-3 my-2' type="number" value={values.w} onChange={handleValuesChange} name='w' /></div>
                <div>height <input className='text-gray-900 px-3 mb-2' type="number" value={values.h} onChange={handleValuesChange} name='h' /></div>
                <div>color depth <input className='text-gray-900 px-3' type="number" value={values.color} onChange={handleValuesChange} name='color' /></div>
            </div>

        </div>
    );
}
