class SubscriptionChecker {
    static async checkAccess() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!user || !token) {
            return {
                hasAccess: false,
                message: 'Please login to access content'
            };
        }

        if (!user.subscriptionPlan || user.subscriptionPlan === 'None') {
            return {
                hasAccess: false,
                message: 'Please subscribe to access content'
            };
        }

        if (user.accessEndTime && new Date(user.accessEndTime) < new Date()) {
            return {
                hasAccess: false,
                message: 'Your subscription has expired'
            };
        }

        return {
            hasAccess: true,
            subscriptionPlan: user.subscriptionPlan,
            accessEndTime: user.accessEndTime
        };
    }
}
