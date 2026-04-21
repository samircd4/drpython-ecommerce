import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from user_agents import parse as ua_parse

logger = logging.getLogger(__name__)

# Simple in-memory blocked users cache
# In production, this should be a Redis cache or database
BLOCKED_USERS = {
    'emails': set(),  # Blocked email addresses
    'ips': set(),     # Blocked IP addresses
}


class VisitorConsumer(AsyncWebsocketConsumer):
    """
    Handles real-time visitor tracking for the admin dashboard.

    Receives visitor data from the main frontend and broadcasts it to
    the admin dashboard's "admin_tracking" group.
    """

    async def connect(self):
        """Accept the WebSocket connection and add to tracking group."""
        try:
            self.user = self.scope.get('user', AnonymousUser())
            self.channel_name_value = self.channel_name

            logger.info(
                f"Visitor connected: user={self.user}, channel={self.channel_name}")

            # Add this connection to the admin_tracking group
            # This allows the admin dashboard to receive all tracking events
            await self.channel_layer.group_add(
                'admin_tracking',
                self.channel_name
            )

            await self.accept()

        except Exception as e:
            logger.error(f"Error accepting WebSocket connection: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        """Clean up when the connection closes."""
        try:
            logger.info(
                f"Visitor disconnected: channel={self.channel_name}, code={close_code}")

            # Remove from the tracking group
            await self.channel_layer.group_discard(
                'admin_tracking',
                self.channel_name
            )
        except Exception as e:
            logger.error(f"Error during WebSocket disconnect: {str(e)}")

    async def receive(self, text_data):
        """
        Receive tracking data from the visitor and broadcast to admin dashboard.

        Expected text_data format:
        {
            "type": "page_view",
            "page_url": "/products",
            "cart_items": 2
        }
        """
        try:
            logger.info(f"[TRACKING RECEIVE] Received data: {text_data}")
            data = json.loads(text_data)

            # Extract user information
            user_info = {
                'user_id': self.user.id if self.user.is_authenticated else None,
                'name': self._get_user_name(),
                'email': self.user.email if self.user.is_authenticated else None,
                'isLoggedIn': self.user.is_authenticated,
            }

            # Extract browser and device info from User-Agent
            user_agent_string = self.scope.get('headers', {})
            headers_dict = {header[0].decode(): header[1].decode()
                            for header in self.scope.get('headers', [])}
            user_agent_string = headers_dict.get('user-agent', 'Unknown')

            browser_info = self._parse_user_agent(user_agent_string)

            # Get client IP
            ip_address = self._get_client_ip()

            # Check if user is blocked
            if self._is_user_blocked(user_info['email'], ip_address):
                logger.info(
                    f"[TRACKING BLOCKED] Blocking user: email={user_info['email']}, ip={ip_address}")
                return  # Don't process blocked users

            # Build the tracking event
            tracking_event = {
                'type': 'visitor_update',
                'visitor_data': {
                    **user_info,
                    **browser_info,
                    'page_url': data.get('page_url', '/'),
                    'cart_items': data.get('cart_items', 0),
                    'ip_address': ip_address,
                    'timestamp': self._get_timestamp(),
                },
            }

            # Broadcast to all admin dashboard connections in the group
            await self.channel_layer.group_send(
                'admin_tracking',
                tracking_event
            )

            logger.info(
                f"[TRACKING BROADCAST] Sent tracking event to admin_tracking group: {tracking_event['visitor_data']}")

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing tracking event: {str(e)}")

    # ==================== Helper Methods ====================

    def _get_user_name(self):
        """Get user's display name."""
        if self.user.is_authenticated:
            if self.user.first_name and self.user.last_name:
                return f"{self.user.first_name} {self.user.last_name}"
            elif self.user.first_name:
                return self.user.first_name
            return self.user.username
        return "Guest User"

    def _parse_user_agent(self, user_agent_string):
        """
        Parse User-Agent string to extract browser and device information.

        Returns:
            dict: Contains 'browser' and 'device' keys
        """
        try:
            ua = ua_parse(user_agent_string)

            # Get browser
            browser = ua.browser.family if ua.browser.family else 'Unknown'

            # Get device type
            if ua.is_mobile:
                device = 'Mobile'
            elif ua.is_tablet:
                device = 'Tablet'
            else:
                device = 'Desktop'

            return {
                'browser': browser,
                'device': device,
            }
        except Exception as e:
            logger.warning(f"Error parsing User-Agent: {str(e)}")
            return {
                'browser': 'Unknown',
                'device': 'Unknown',
            }

    def _get_client_ip(self):
        """
        Extract client IP address, accounting for proxies.
        """
        # Check for X-Forwarded-For first (for proxied requests)
        headers_dict = {header[0].decode(): header[1].decode()
                        for header in self.scope.get('headers', [])}

        x_forwarded_for = headers_dict.get('x-forwarded-for')
        if x_forwarded_for:
            # X-Forwarded-For can contain multiple IPs; the first is the original
            return x_forwarded_for.split(',')[0].strip()

        # Fall back to the client address
        client = self.scope.get('client')
        if client:
            return client[0]

        return 'Unknown'

    def _get_timestamp(self):
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.utcnow().isoformat()

    def _is_user_blocked(self, email, ip_address):
        """
        Check if a user is in the blocked list.
        Users can be blocked by email (logged-in users) or IP (guests).
        """
        if email and email in BLOCKED_USERS['emails']:
            return True
        if ip_address and ip_address in BLOCKED_USERS['ips']:
            return True
        return False

    @staticmethod
    def add_blocked_user(email=None, ip_address=None):
        """Add a user to the blocked list."""
        if email:
            BLOCKED_USERS['emails'].add(email)
        if ip_address:
            BLOCKED_USERS['ips'].add(ip_address)

    @staticmethod
    def remove_blocked_user(email=None, ip_address=None):
        """Remove a user from the blocked list."""
        if email and email in BLOCKED_USERS['emails']:
            BLOCKED_USERS['emails'].discard(email)
        if ip_address and ip_address in BLOCKED_USERS['ips']:
            BLOCKED_USERS['ips'].discard(ip_address)

    # ==================== Message Handlers ====================

    async def visitor_update(self, event):
        """
        Handle visitor_update messages from the group.
        This is called when broadcasting to connected consumers.
        """
        # Forward the tracking data to the WebSocket
        await self.send(text_data=json.dumps(event))
