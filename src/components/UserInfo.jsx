import { useState, useEffect } from 'react';

import './UserInfo.css';

import { apiClient } from '../service/backend';
import { useVideoContext } from '../context/VideoContext';

const UserInfo = () => {
    const { accountInfo } = useVideoContext();
    const [authInfo, setAuthInfo] = useState(null);

    useEffect(() => {
        apiClient.getIAPAuthInfo((res) => {
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
                    Remaing Credits: 1111/30000
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
                    // Remaing Credits: {accountInfo.remaining_quantity}/{accountInfo.total_quantity}

export default UserInfo;