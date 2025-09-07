class ContentAccess {
    constructor() {
        this.contentContainer = document.getElementById('resourcesContainer');
        this.accessMessage = document.getElementById('accessMessage');
        this.init();
    }

    async init() {
        const accessStatus = await SubscriptionChecker.checkAccess();
        
        if (!accessStatus.hasAccess) {
            this.showAccessDenied(accessStatus.message);
            return;
        }

        await this.loadContent();
    }

    showAccessDenied(message) {
        this.contentContainer.style.display = 'none';
        this.accessMessage.querySelector('.message-text').textContent = message;
        this.accessMessage.style.display = 'flex';
    }

    async loadContent() {
        try {
            const response = await fetch('/api/content', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            this.renderContent(data.content);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showAccessDenied('Error loading content. Please try again.');
        }
    }

    renderContent(content) {
        this.contentContainer.innerHTML = content.map(item => `
            <div class="resource-card ${item.type}-card">
                <div class="resource-icon">
                    <i class="${this.getIconForType(item.type)}"></i>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
                <button class="btn btn-primary" onclick="viewResource('${item._id}')">
                    View Resource
                </button>
            </div>
        `).join('');
    }

    getIconForType(type) {
        const icons = {
            video: 'fas fa-video',
            pdf: 'fas fa-file-pdf',
            audio: 'fas fa-music',
            article: 'fas fa-file-alt'
        };
        return icons[type] || 'fas fa-file';
    }
}

function redirectToSubscription() {
    window.location.href = 'subscription.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new ContentAccess();
});
