import { useState, useEffect } from 'react';

import './UserInfo.css';

import { apiClient } from '@/service/backend';
import { useVideoContext } from '@/context/VideoContext';

const UserInfo = () => {
    const { accountInfo } = useVideoContext();
    const [authInfo, setAuthInfo] = useState(null);

    useEffect(() => {
        apiClient.getIAPAuthInfo().then((res) => {
            if (res) {
                console.log('User info:', res);
                setAuthInfo(res);
            }
        });
    }, []);

    return (
        <div className='container'>
            {accountInfo && (
                <div className="credit-info">
                    Remaing Credits: {accountInfo.remaining_quantity}/{accountInfo.total_quantity}
                </div>
            )}
            {authInfo && (
                <div className='auth-info'>
                    Welcome, {authInfo.name}!
                </div>
            )}
        </div>
    )
}

export default UserInfo;
