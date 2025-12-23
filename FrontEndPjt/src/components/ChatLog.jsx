import React, { useEffect, useState } from 'react';

const ChatLog = ({ messages }) => {
    const [imageUrls, setImageUrls] = useState([]);

    useEffect(() => {
        const urls = messages.map((message) => {
            if (message.type === 'image') {
                const { data, mimeType } = message.content || {};
                const blob = new Blob([data], { type: mimeType || 'image/jpeg' });
                return URL.createObjectURL(blob);
            }
            return null;
        });

        setImageUrls(urls);

        return () => {
            urls.forEach((url) => {
                if (url) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [messages]);

    return (
        <>
            <h3>채팅 로그</h3>
            <div className='chatLog'>
                {messages.map((message, index) => {
                    if (message.type == 'text') {
                        return <div key={index}>{message.content}</div>
                    } else if (message.type === 'image') {
                        const url = imageUrls[index];
                        return url ? <div key={index}><img src={url} alt="img" /></div> : null;
                    } else {
                        return null
                    }
                })}
            </div>
        </>
    );
};

export default ChatLog;
