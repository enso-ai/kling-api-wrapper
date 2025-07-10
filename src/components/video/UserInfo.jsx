import { useState, useEffect } from 'react';

import styles from './UserInfo.module.css';

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
        <div className={styles.container}>
            {accountInfo && (
                <div className={styles.creditInfo}>
                    Remaing Credits: {accountInfo.remaining_quantity}/{accountInfo.total_quantity}
                </div>
            )}
            {authInfo && (
                <div className={styles.authInfo}>
                    Welcome, {authInfo.name}!
                </div>
            )}
        </div>
    )
}

export default UserInfo;
