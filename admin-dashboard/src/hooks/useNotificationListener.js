import { useEffect, useRef } from 'react';
import { useNotification } from '../Context/NotificationContext';

/** Run `handler` for every live notification pushed over the shared notification socket. */
const useNotificationListener = (handler) => {
    const { subscribe } = useNotification();
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    });

    useEffect(() => subscribe((data) => handlerRef.current(data)), [subscribe]);
};

export default useNotificationListener;
