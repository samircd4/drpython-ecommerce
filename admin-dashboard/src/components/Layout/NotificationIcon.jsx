import { getNotificationIcon } from './notificationMeta';

const NotificationIcon = ({ type, className = 'w-4 h-4' }) => {
    const { icon: Icon, color } = getNotificationIcon(type);
    return <Icon className={`${className} ${color}`} />;
};

export default NotificationIcon;
